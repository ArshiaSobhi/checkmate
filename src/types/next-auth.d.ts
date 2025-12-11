import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      role: string;
      rank: string;
      rankPoints: number;
      emailVerified?: string | null;
    };
  }

  interface User extends DefaultUser {
    username: string;
    role: string;
    rank: string;
    rankPoints: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    username?: string;
    rank?: string;
    rankPoints?: number;
    emailVerified?: string | null;
  }
}
