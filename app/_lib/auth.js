import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createGuest, getGuest } from "./data-service";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    async signIn({ user, account, profile }) {
      try {
        const existingGuest = await getGuest(user.email);

        if (!existingGuest)
          await createGuest({ email: user.email, fullName: user.name });

        return true;
      } catch {
        return false;
      }
    },
    async session({ session, user }) {
      // 这个回调会在两种运行时里被调用：
      //   1. 页面 / Server Action  → Node 运行时，能连数据库
      //   2. middleware            → Edge 运行时，可能连不上数据库
      // 所以查不到时不能让它抛错，否则整个 session 就没了，
      // 表现为"登录成功但一进 /account 就被踢回登录页"。用 ?. 兜底。
      const guest = await getGuest(session.user.email);
      session.user.guestId = guest?.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
