import Chat from "@/components/chat";
import { cookies } from "next/headers";
import { chatbotData } from "@/lib/data";

export default async function Group1Page() {
  const cookieStore = cookies();
  const userInfo = cookieStore.get("user_info");

  // Create a serializable version of the chatbot data
  const chatbot = chatbotData.group1;

  return (
    <div className="flex flex-col h-screen bg-gray-800">
      <Chat
        userInfo={userInfo?.value ? JSON.parse(userInfo.value) : null}
        chatbot={chatbot}
      />
    </div>
  );
}
