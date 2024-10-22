"use client";

import { ImageInput } from "@/components/_shared/ImageInput";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import { profileFormSchema } from "@/app/_schemas/profile.schema";
import type { ProfileFormSchema } from "@/app/_schemas/profile.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const UpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const form = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
  });

  useEffect(() => {
    if (session?.user) {
      form.setValue("name", session.user.name ?? "");
      form.setValue("image", session.user.image ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  const updateMutation = api.user.updateProfile.useMutation({
    onSuccess() {
      toast.success("Your profile has been updated successfully.");
    },
    onError() {
      toast.error("Failed to update profile");
    },
  });

  const onSubmit = async (values: ProfileFormSchema) => {
    let imagePath = null;
    // if image is updated then upload it to the server
    try {
      if (values.image && values.image instanceof FileList) {
        setIsLoading(true);
        const formData = new FormData();

        formData.append("file", values.image[0]! as File);

        // Upload the image to the server
        const { data } = await axios.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        imagePath = data.filePath;
      }
    } catch {
      form.setError("image", { message: "Select a different image" });
    } finally {
      setIsLoading(false);
    }

    updateMutation.mutate({
      name: values.name,
      image: imagePath,
    });
  };

  return (
    <>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ImageInput
              watch={form.watch}
              register={form.register}
              name="image"
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateMutation.isPending || isLoading}
        >
          {updateMutation.isPending || isLoading ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </>
  );
};
