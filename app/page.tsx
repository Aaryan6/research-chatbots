import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { cookies } from "next/headers";
import Chat from "@/components/chat";
import { chatbotData } from "@/lib/data";

export default async function Home() {
  const cookieStore = cookies();
  const userInfo = cookieStore.get("iitb_user");

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      <Chat userInfo={userInfo?.value ? JSON.parse(userInfo.value) : null} />
    </main>
  );
}
