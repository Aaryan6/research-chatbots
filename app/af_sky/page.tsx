import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { cookies } from "next/headers";
import Chat from "@/components/chat";
import { getUserInfo } from "../actions";

export default async function AfSkyPage() {
  const cookieStore = cookies();
  const userInfo = cookieStore.get("iitb_user");
  let validatedUserInfo = null;

  if (userInfo?.value) {
    try {
      const parsedUserInfo = JSON.parse(userInfo.value);
      const dbUser = await getUserInfo(parsedUserInfo.email);

      if (dbUser) {
        validatedUserInfo = {
          ...dbUser,
          group: 6 // Automatically set group for af_sky
        };
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="container mx-auto">
        <Hero />
        <Chat userInfo={validatedUserInfo} hideGroupSelect={true} predefinedGroup={6} />
      </div>
    </main>
  );
} 