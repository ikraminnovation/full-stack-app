/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import { compare } from "bcryptjs";
import { db } from "@/server/db";
import Credentials from "next-auth/providers/credentials";
import { generateSessionToken } from "@/lib/auth-utils";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  debug: true,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.sessionToken = (user as unknown as { token: string })?.token;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const dbSession = await db.session.findUnique({
        where: { sessionToken: token.sessionToken as string },
        include: { user: true },
      });

      if (dbSession) {
        session.user = dbSession.user;
        session.expires = dbSession.expires.toISOString();
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).getTime(),
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials ?? {};
        const user = await db.user.findUnique({
          where: { email },
        });
        console.log("user: ", user);
        if (!user || !password || !user.password) {
          throw new Error("Invalid credentials");
        }

        const passwordMatched = await compare(password, user.password);

        if (!passwordMatched) {
          throw new Error("User not found.");
        }

        const sessionToken = generateSessionToken();

        await db.session.create({
          data: {
            userId: user.id,
            sessionToken,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          },
        });
        return { ...user, token: sessionToken };
      },
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: "/signin",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
