import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import db from "./db";
import Google from "next-auth/providers/google";
import { fetchRedis } from "../helpers/redis";


function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }
  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET");
  }
  return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // For Google, use user.id or user.sub
        token.id = (user as { id?: string; sub?: string }).id || (user as { sub?: string }).sub || "";
      }
      const dbUserResult = await fetchRedis(
        "get",
        `user:${token.id}`
      ) as string | null;

      if (!dbUserResult) {
        // User does not exist in DB, create it using your Redis client
        if (token.id && token.email && token.name) {
          const userData = {
            id: token.id,
            name: token.name,
            email: token.email,
            image: token.picture || (user && (user as any).image) || null,
          };
          try {
            await db.set(`user:${token.id}`, JSON.stringify(userData));
          } catch (e) {
            // ignore or log error
          }
        }
        return token;
      }
      const dbUser = JSON.parse(dbUserResult) as User;

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    redirect: async () => {
      return "/dashboard";
    },
  },
};
