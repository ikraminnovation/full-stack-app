import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string({ message: "Name is required" }).min(2, {
    message: "Name must be at least 2 characters.",
  }),
  image: z
    .any()
    .refine(
      (t) =>
        !(t instanceof FileList) ||
        t.length !== 1 ||
        t[0]?.type.startsWith("image/"),
      "Only images are allowed",
    ),
});

export type ProfileFormSchema = z.infer<typeof profileFormSchema>;
