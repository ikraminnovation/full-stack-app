import { redirect } from "next/navigation";
import { PostForm } from "../_components/PostForm";
import { getServerAuthSession } from "@/server/auth";

export default async function PostPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/signin");
  }
  return <PostForm />;
}