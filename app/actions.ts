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

export type Conversation = {
  id: string;
  user_email: string;
  messages: Message[];
  avg_empathy_score: number;
  dominant_sentiment: string;
  created_at: string;
  reactions: { msg_id: string; reaction: "like" | "dislike" }[];
};

export type EmpathyScoreData = {
  date: string;
  score: number;
};

export type ReactionData = {
  name: ReactionType;
  value: number;
};

export type SentimentData = {
  name: string;
  value: number;
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

export async function getConversations(groupId: string = "overall") {
  try {
    let query = supabase
      .from("iitb_conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (groupId !== "overall") {
      query = query.eq("group_id", groupId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data as Conversation[];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

export async function getEmpathyScoresTrend(groupId: string = "overall") {
  try {
    let query = supabase
      .from("iitb_conversations")
      .select("created_at, avg_empathy_score");

    if (groupId !== "overall") {
      query = query.eq("group_id", groupId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Process data to get daily averages
    const dailyScores: { [key: string]: { sum: number; count: number } } = {};
    data.forEach((conv) => {
      const date = new Date(conv.created_at).toISOString().split("T")[0];
      if (!dailyScores[date]) {
        dailyScores[date] = { sum: 0, count: 0 };
      }
      dailyScores[date].sum += conv.avg_empathy_score || 0;
      dailyScores[date].count += 1;
    });

    return Object.entries(dailyScores)
      .map(([date, { sum, count }]) => ({
        date,
        score: Number((sum / count).toFixed(1)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching empathy scores:", error);
    return [];
  }
}

export async function getReactionStats(groupId: string = "overall") {
  try {
    let query = supabase.from("iitb_conversations").select("reactions");

    if (groupId !== "overall") {
      query = query.eq("group_id", groupId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const reactionCounts = {
      like: 0,
      dislike: 0,
    } as Record<ReactionType, number>;

    data.forEach((conversation) => {
      if (conversation.reactions && Array.isArray(conversation.reactions)) {
        conversation.reactions.forEach((reactionItem) => {
          if (reactionItem.reaction in reactionCounts) {
            reactionCounts[reactionItem.reaction as ReactionType]++;
          }
        });
      }
    });

    const reactionStats = Object.entries(reactionCounts).map(
      ([name, value]) => ({
        name: name as ReactionType,
        value,
      })
    );

    return reactionStats;
  } catch (error) {
    console.error("Error fetching reaction stats:", error);
    return [];
  }
}

export async function getSentimentStats(groupId: string = "overall") {
  try {
    let query = supabase
      .from("iitb_conversations")
      .select("dominant_sentiment");

    if (groupId !== "overall") {
      query = query.eq("group_id", groupId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const sentimentCounts: { [key: string]: number } = {
      "very negative": 0,
      negative: 0,
      neutral: 0,
      positive: 0,
      "very positive": 0,
    };

    data.forEach((conv) => {
      if (conv.dominant_sentiment) {
        sentimentCounts[conv.dominant_sentiment.toLowerCase()] =
          (sentimentCounts[conv.dominant_sentiment.toLowerCase()] || 0) + 1;
      }
    });

    return Object.entries(sentimentCounts).map(([name, value]) => ({
      name,
      value,
    }));
  } catch (error) {
    console.error("Error fetching sentiment stats:", error);
    return [];
  }
}

export async function getDashboardStats(groupId: string = "overall") {
  try {
    let query = supabase.from("iitb_conversations").select("*");

    if (groupId !== "overall") {
      query = query.eq("group_id", groupId);
    }

    const { data: conversations, error } = await query;

    if (error) throw error;

    const totalConversations = conversations.length;
    const avgEmpathyScore =
      conversations.reduce(
        (sum, conv) => sum + (conv.avg_empathy_score || 0),
        0
      ) / (totalConversations || 1);

    const positiveSentiments = conversations.filter(
      (conv) =>
        conv.dominant_sentiment === "positive" ||
        conv.dominant_sentiment === "very positive"
    ).length;
    const positiveSentimentPercentage =
      Math.round((positiveSentiments / totalConversations) * 100) || 0;

    // Calculate average response time (placeholder - implement based on your data structure)
    const avgResponseTime = 2.5; // This should be calculated based on actual response time data

    return {
      totalConversations,
      avgEmpathyScore: avgEmpathyScore.toFixed(1),
      positiveSentimentPercentage,
      avgResponseTime,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalConversations: 0,
      avgEmpathyScore: "0",
      positiveSentimentPercentage: 0,
      avgResponseTime: 0,
    };
  }
}
