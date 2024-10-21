"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";

export const PostForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const { data: post, isLoading } = api.post.getPostById.useQuery(
    {
      id: Number(postId),
    },
    {
      enabled: !!postId,
    },
  );

  const createMutation = api.post.create.useMutation({
    onSuccess: () => {
      router.push("/");
    },
    onError: () => {
      setError("Failed to create post");
    },
  });

  const updateMutation = api.post.update.useMutation({
    onSuccess: () => {
      router.push(`/post/${postId}`);
    },
    onError: () => {
      setError("Failed to create post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    if (postId) {
      updateMutation.mutate({
        id: Number(postId),
        name: title,
        description: content,
      });
    } else {
      createMutation.mutate({ name: title, description: content });
    }
  };

  const isPending =
    createMutation.isPending || updateMutation.isPending || isLoading;

  useEffect(() => {
    if (postId && post) {
      setTitle(post.name);
      setContent(post.description);
    }
  }, [postId, post]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{postId ? "Edit Post" : "Create New Post"}</CardTitle>
          <CardDescription>
            {postId ? "Edit your post" : "Share your thoughts with the world"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your post title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                  }
                  placeholder="Write your post content here"
                  required
                  rows={10}
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="mt-6 w-full" disabled={isPending}>
              {!!postId &&
                (isLoading
                  ? "Fetching post data"
                  : isPending
                    ? "Updating..."
                    : "Update Post")}
              {!postId && (isPending ? "Creating..." : "Create Post")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            disabled={isPending}
            className="w-full"
            variant="ghost"
            onClick={() => router.push("/")}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
