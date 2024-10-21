"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Heart } from "lucide-react";
import type { Comment } from "@prisma/client";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";

interface CommentsProps {
  postId: number;
  comments: (Comment & {
    author: { name: string | null; image: string | null };
  })[];
}

export const Comments = ({ postId, comments }: CommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const utils = api.useUtils();

  const addMutation = api.post.addComment.useMutation({
    onSuccess: async () => {
      setNewComment("");
      utils.post.getPostById.invalidate({ id: Number(postId) });
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addMutation.mutate({
        content: newComment.trim(),
        postId,
      });
    }
  };

  // const handleLikeComment = (commentId: string) => {
  //   setComments(
  //     comments.map((comment) =>
  //       comment.id === commentId
  //         ? { ...comment, likes: comment.likes + 1 }
  //         : comment,
  //     ),
  //   );
  //   // Here you would typically send the like action to your API
  // };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full"
        />
        <Button onClick={handleAddComment} disabled={addMutation.isPending}>
          {addMutation.isPending ? "Posting..." : "Post Comment"}
        </Button>
      </div>
      {!!comments?.length && <Separator />}
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-2">
          <div className="flex items-start gap-4 px-2">
            <Avatar>
              <AvatarImage src={comment.author?.image ?? ""} />
              <AvatarFallback>{comment.author?.name ?? ""}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{comment.author?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(
                    comment.createdAt.toISOString(),
                    "MMM d, yyyy 'at' h:mm a",
                  )}
                </p>
              </div>
              <p className="text-sm">{comment.content}</p>
              {/* <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handleLikeComment(comment.id)}
                >
                  <Heart className="mr-1 h-4 w-4" />
                  {comment.likes} {comment.likes === 1 ? "Like" : "Likes"}
                </Button>
              </div> */}
            </div>
          </div>
          <Separator />
        </div>
      ))}
    </div>
  );
};
