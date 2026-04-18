import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/lib/models";

// Type augmentations live in types/next-auth.d.ts — no `as any` needed here.
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await (UserModel as any)
          .findOne({ email: credentials.email.toLowerCase() })
          .lean();
        if (!user) return null;
        const valid = await bcrypt.compare(
          credentials.password,
          user.password as string,
        );
        if (!valid) return null;
        return {
          id: (user._id as { toString(): string }).toString(),
          email: user.email as string,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  pages: { signIn: "/auth" },
  secret: process.env.NEXTAUTH_SECRET,
};
