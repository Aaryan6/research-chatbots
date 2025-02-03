import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { cookies } from "next/headers";
import Chat from "@/components/chat";
import { getUserInfo } from "./actions";

export default async function Home() {
  const cookieStore = cookies();
  const userInfo = cookieStore.get("iitb_user");
  let validatedUserInfo = null;

  if (userInfo?.value) {
    try {
      const parsedUserInfo = JSON.parse(userInfo.value);
      const dbUser = await getUserInfo(parsedUserInfo.email);

      if (dbUser) {
        validatedUserInfo = dbUser;
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      <Chat userInfo={validatedUserInfo} />
    </main>
  );
}
