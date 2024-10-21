import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { LatestPost } from "./_components/LatestPost";
import { api } from "@/trpc/server";

export default async function HomePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/signin");
  }

  void api.post.getLatest.prefetch();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {session.user?.name}</h1>
      </div>

      <LatestPost />
    </div>
  );
}
