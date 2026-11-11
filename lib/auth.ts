import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type LoginContext = "staff" | "resident";

/** Roles allowed through each login page (Prompt 4). */
const ALLOWED_ROLES: Record<LoginContext, string[]> = {
  staff: ["SUPER_ADMIN", "STAFF"],
  resident: ["RESIDENT"],
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Concierge",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginContext: { label: "Login context", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        const context = (credentials?.loginContext === "resident" ? "resident" : "staff") as LoginContext;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { resident: { select: { id: true } } },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Each login page only admits its own roles.
        if (!ALLOWED_ROLES[context].includes(user.role)) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          residentId: user.resident?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.residentId = (user as { residentId: string | null }).residentId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub as string,
        role: token.role as string,
        residentId: (token.residentId as string | null) ?? null,
      };
      return session;
    },
  },
};
