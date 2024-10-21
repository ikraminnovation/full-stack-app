"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { Heart, MessageCircle } from "lucide-react";
import { Comments } from "@/app/_components/Comments";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function PostDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const session = useSession();
  const [expandedComment, setExpandedComment] = useState(false);

  const utils = api.useUtils();

  const likeMutation = api.post.addLike.useMutation({
    onSuccess: async () => {
      utils.post.getPostById.invalidate({ id: Number(postId) });
    },
  });

  const {
    data: post,
    isLoading,
    isError,
  } = api.post.getPostById.useQuery(
    {
      id: Number(postId),
    },
    {
      enabled: !!postId,
    },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100svh-80px)] items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100svh-80px)] flex-col justify-center gap-4 px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load post. Please try again later.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")} className="max-w-max">
          Go to Home
        </Button>
      </div>
    );
  }

  if (!post) {
    return <p>Post not found</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl">{post.name}</CardTitle>
          <CardDescription>
            By {post.createdBy?.name} | Published on{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="mb-4">{post.description}</p>
          </div>
        </CardContent>
        <CardFooter className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full justify-between gap-4">
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled={likeMutation.isPending}
                onClick={() => likeMutation.mutate({ postId: post.id })}
              >
                <Heart
                  className={cn("mr-1 h-4 w-4", {
                    "fill-red-500 text-red-500": post.likes
                      .map((item) => item.userId)
                      .includes(session?.data?.user.id ?? ""),
                  })}
                />
                Like
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setExpandedComment((pre) => !pre)}
              >
                <MessageCircle className="mr-1 h-4 w-4" />
                Comment
              </Button>
            </div>
            {session.data?.user.id === post.createdById && (
              <Button
                variant="outline"
                onClick={() => router.push(`/post/${post.id}/edit`)}
              >
                Edit Post
              </Button>
            )}
          </div>
          {expandedComment && (
            <Comments postId={post.id} comments={post.comments} />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
