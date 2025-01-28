"use server";

import { cookies } from "next/headers";
import supabase from "@/lib/db";
import { Message } from "ai";

export type UserFormData = {
  name: string;
  email: string;
  location: string;
  age: number;
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
  feedback: string;
};

export async function saveUserInfo(data: UserFormData) {
  try {
    // Save to Supabase
    const { error } = await supabase.from("chatbot_users").insert([
      {
        name: data.name,
        email: data.email,
        location: data.location,
        age: data.age,
      },
    ]);

    if (error) throw error;

    // Save to cookies
    const cookieStore = cookies();
    cookieStore.set("user_info", JSON.stringify(data), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
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
        feedback_text: data.feedback.trim(),
        is_completed: true
      })
      .eq('id', data.chatId);

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
      .eq('id', chatId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error ending chat:", error);
    return { success: false, error };
  }
}
