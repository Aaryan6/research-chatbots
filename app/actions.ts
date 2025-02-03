"use server";

import { cookies } from "next/headers";
import supabase from "@/lib/db";
import { Message } from "ai";
import { AnalyticsData } from "@/lib/types";

export type UserFormData = {
  name: string;
  email: string;
  group: number;
};

export type ChatFormData = {
  id: string;
  user_email: string;
  messages: Message[];
  created_at?: string;
  group_id: number;
};

export type FeedbackData = {
  chatId: string;
  rating: number;
};

export type ReactionType = "like" | "dislike";

export type MessageReaction = {
  messageId: string;
  chatId: string;
  reactionType: ReactionType;
};

export async function saveUserInfo(data: UserFormData) {
  try {
    // Save to Supabase
    const { error } = await supabase.from("iitb_users").insert({
      name: data.name,
      email: data.email,
      group: data.group,
    });

    if (error) throw error;

    // Save to cookies
    const cookieStore = cookies();
    cookieStore.set("iitb_user", JSON.stringify(data), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving user info:", error);
    return { success: false, error };
  }
}

export async function getUserInfo(email: string) {
  const { data, error } = await supabase
    .from("iitb_users")
    .select("*")
    .eq("email", email);

  if (error) {
    const cookieStore = cookies();
    cookieStore.delete("iitb_user");
    throw error;
  }

  if (!data || data.length === 0) {
    const cookieStore = cookies();
    cookieStore.delete("iitb_user");
    return null;
  }

  return data[0];
}

export async function saveChat(data: ChatFormData) {
  const { error } = await supabase.from("iitb_conversations").upsert({
    id: data.id,
    user_email: data.user_email,
    messages: data.messages,
    group_id: data.group_id,
  });

  if (error) throw error;

  return { success: true };
}

export async function saveFeedback(data: FeedbackData) {
  try {
    const { error } = await supabase
      .from("iitb_conversations")
      .update({
        feedback_rating: parseInt(data.rating.toString()),
        is_completed: true,
      })
      .eq("id", data.chatId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false, error };
  }
}

export async function endChat(chatId: string) {
  try {
    const { error } = await supabase
      .from("iitb_conversations")
      .update({ is_completed: true })
      .eq("id", chatId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error ending chat:", error);
    return { success: false, error };
  }
}

export async function saveMessageReaction(data: MessageReaction) {
  try {
    // First, check if a reaction exists
    const { data: existingReaction } = await supabase
      .from("message_reactions")
      .select()
      .eq("message_id", data.messageId)
      .eq("chat_id", data.chatId)
      .single();

    let action: "deleted" | "updated" | "inserted" = "inserted";

    // Handle the message_reactions table
    if (existingReaction) {
      if (existingReaction.reaction_type === data.reactionType) {
        // Delete reaction
        const { error: deleteError } = await supabase
          .from("message_reactions")
          .delete()
          .eq("message_id", data.messageId)
          .eq("chat_id", data.chatId);

        if (deleteError) throw deleteError;
        action = "deleted";
      } else {
        // Update reaction
        const { error: updateError } = await supabase
          .from("message_reactions")
          .update({ reaction_type: data.reactionType })
          .eq("message_id", data.messageId)
          .eq("chat_id", data.chatId);

        if (updateError) throw updateError;
        action = "updated";
      }
    } else {
      // Insert new reaction
      const { error: insertError } = await supabase
        .from("message_reactions")
        .insert({
          message_id: data.messageId,
          chat_id: data.chatId,
          reaction_type: data.reactionType,
        });

      if (insertError) throw insertError;
    }

    // Get all reactions for this chat to update iitb_conversations
    const { data: allReactions, error: reactionsError } = await supabase
      .from("message_reactions")
      .select("*")
      .eq("chat_id", data.chatId);

    if (reactionsError) throw reactionsError;

    // Update iitb_conversations with the reactions
    const { error: updateChatError } = await supabase
      .from("iitb_conversations")
      .update({
        message_reactions: allReactions || [],
      })
      .eq("id", data.chatId);

    if (updateChatError) throw updateChatError;

    return { success: true, action };
  } catch (error) {
    console.error("Error saving message reaction:", error);
    return { success: false, error };
  }
}

export async function addAnalytics(data: AnalyticsData) {
  // First insert the new empathy score
  const { error: insertError } = await supabase
    .from("iitb_chatbot_empathy_scores")
    .insert(data);

  if (insertError) throw insertError;

  // Fetch all empathy scores for this conversation
  const { data: allScores, error: fetchError } = await supabase
    .from("iitb_chatbot_empathy_scores")
    .select("er, ip, ex, empathy_score, sentiment")
    .eq("conversation_id", data.conversation_id);

  if (fetchError) throw fetchError;

  type SentimentCounts = { [key: string]: number };
  type Averages = {
    er: number;
    ip: number;
    ex: number;
    empathy_score: number;
    sentiment_counts: SentimentCounts;
  };

  // Calculate averages
  const averages = allScores.reduce(
    (acc: Averages, score) => {
      return {
        er: acc.er + score.er,
        ip: acc.ip + score.ip,
        ex: acc.ex + score.ex,
        empathy_score: acc.empathy_score + score.empathy_score,
        sentiment_counts: {
          ...acc.sentiment_counts,
          [score.sentiment]: (acc.sentiment_counts[score.sentiment] || 0) + 1,
        },
      };
    },
    { er: 0, ip: 0, ex: 0, empathy_score: 0, sentiment_counts: {} }
  );

  const count = allScores.length;
  const avgEr = averages.er / count;
  const avgIp = averages.ip / count;
  const avgEx = averages.ex / count;
  const avgEmpathyScore = averages.empathy_score / count;

  // Get most frequent sentiment
  const entries = Object.entries(averages.sentiment_counts) as [
    string,
    number
  ][];
  const dominantSentiment =
    entries.length > 0
      ? entries.reduce((a, b) => (a[1] > b[1] ? a : b), entries[0])[0]
      : "Neutral"; // Default sentiment if no entries exist

  // Update the conversations table with averages
  const { error: updateError } = await supabase
    .from("iitb_conversations")
    .update({
      avg_er: avgEr,
      avg_ip: avgIp,
      avg_ex: avgEx,
      avg_empathy_score: avgEmpathyScore,
      dominant_sentiment: dominantSentiment,
    })
    .eq("id", data.conversation_id);

  if (updateError) throw updateError;

  return { success: true };
}

export async function deleteUserCookie() {
  const cookieStore = cookies();
  cookieStore.delete("iitb_user");
}

export async function addReaction(data: MessageReaction) {
  try {
    // First get the current conversation to access existing reactions
    const { data: currentConversation, error: fetchError } = await supabase
      .from("iitb_conversations")
      .select("reactions")
      .eq("id", data.chatId)
      .single();

    if (fetchError) throw fetchError;

    let updatedReactions = currentConversation?.reactions || [];

    // Check if reaction already exists
    const existingReactionIndex = updatedReactions.findIndex(
      (r: { msg_id: string; reaction: string }) => r.msg_id === data.messageId
    );

    if (existingReactionIndex !== -1) {
      // If same reaction, remove it (toggle off)
      if (
        updatedReactions[existingReactionIndex].reaction === data.reactionType
      ) {
        updatedReactions.splice(existingReactionIndex, 1);
      } else {
        // If different reaction, update it
        updatedReactions[existingReactionIndex].reaction = data.reactionType;
      }
    } else {
      // Add new reaction
      updatedReactions.push({
        msg_id: data.messageId,
        reaction: data.reactionType,
      });
    }

    // Update the conversation with new reactions
    const { error: updateError } = await supabase
      .from("iitb_conversations")
      .update({ reactions: updatedReactions })
      .eq("id", data.chatId);

    if (updateError) throw updateError;

    return { success: true, reactions: updatedReactions };
  } catch (error) {
    console.error("Error managing reaction:", error);
    return { success: false, error };
  }
}
