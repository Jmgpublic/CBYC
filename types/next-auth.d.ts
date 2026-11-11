import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      /** Set only for RESIDENT sessions. Used for row-level isolation. */
      residentId: string | null;
    };
  }

  interface User {
    role: string;
    residentId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    residentId?: string | null;
  }
}
