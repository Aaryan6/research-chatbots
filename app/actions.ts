"use server";

import { cookies } from "next/headers";
import supabase from "@/lib/db";
import { Message } from "ai";

export type UserFormData = {
  name: string;
  email: string;
  group: string;
};

export type ChatFormData = {
  id: string;
  user_email: string;
  messages: Message[];
  created_at?: string;
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
    const { error } = await supabase.from("chatbot_users").insert([
      {
        name: data.name,
        email: data.email,
        group: data.group,
      },
    ]);

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

export async function saveChat(data: ChatFormData) {
  const { error } = await supabase.from("chatbot_chats").upsert({
    id: data.id,
    user_email: data.user_email,
    messages: data.messages,
  });

  if (error) throw error;

  return { success: true };
}

export async function saveFeedback(data: FeedbackData) {
  try {
    const { error } = await supabase
      .from("chatbot_chats")
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
      .from("chatbot_chats")
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
    console.log("Saving reaction:", data);

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

    // Get all reactions for this chat to update chatbot_chats
    const { data: allReactions, error: reactionsError } = await supabase
      .from("message_reactions")
      .select("*")
      .eq("chat_id", data.chatId);

    if (reactionsError) throw reactionsError;

    // Update chatbot_chats with the reactions
    const { error: updateChatError } = await supabase
      .from("chatbot_chats")
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
