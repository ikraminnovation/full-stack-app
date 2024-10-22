import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        image: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Update user with the uploaded image path (if any) and other fields
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          image: input.image ?? undefined,
        },
      });
    }),

  updatePassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const foundUser = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!foundUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const isPasswordCorrect = await compare(
        input.oldPassword,
        foundUser.password!,
      );
      if (!isPasswordCorrect) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid current password",
        });
      }

      const hashedPassword = await hash(input.newPassword, 12);

      return ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          password: hashedPassword,
        },
      });
    }),
});
