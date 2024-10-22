/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({ name: z.string().min(1), description: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
          description: input.description,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.coerce.number(),
        name: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return post ?? null;
  }),

  getPostById: protectedProcedure
    .input(z.object({ id: z.coerce.number() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          createdBy: {
            select: {
              name: true,
              id: true,
            },
          },
          likes: true,
          comments: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              author: {
                select: {
                  name: true,
                  image: true,
                  id: true,
                },
              },
            },
          },
        },
      });
      return post ?? null;
    }),

  addComment: protectedProcedure
    .input(z.object({ postId: z.coerce.number(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.create({
        data: {
          content: input.content,
          post: { connect: { id: input.postId } },
          author: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  addLike: protectedProcedure
    .input(z.object({ postId: z.coerce.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      // Check if the user has already liked the post
      const existingLike = await ctx.db.like.findUnique({
        where: {
          postId_userId: {
            postId: input.postId,
            userId: userId,
          },
        },
      });

      if (existingLike) {
        // If a like exists, remove it (unlike)
        await ctx.db.like.delete({
          where: {
            id: existingLike.id,
          },
        });
      } else {
        // If no like exists, add it (like)
        await ctx.db.like.create({
          data: {
            post: { connect: { id: input.postId } },
            user: { connect: { id: userId } },
          },
        });
      }
    }),
});
