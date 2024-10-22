"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import Link from "next/link";

export function LatestPost() {
  const [posts] = api.post.getLatest.useSuspenseQuery();

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src={
                    post.createdBy.image ??
                    `https://avatar.vercel.sh/${post.createdBy.name}`
                  }
                />
                <AvatarFallback>{post.createdBy.name}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{post.createdBy.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(post.createdAt, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <h3 className="mb-2 text-lg font-semibold">{post.name}</h3>
            <p className="text-sm text-muted-foreground">{post.description}</p>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-4">
            <Link href={`/post/${post.id}`}>
              <Button variant="outline" size="sm">
                View Post
              </Button>
            </Link>
          </CardFooter>
          <Separator />
        </Card>
      ))}
    </div>
  );
}
