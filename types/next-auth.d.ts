// types/next-auth.d.ts

import NextAuth, { DefaultSession, User as DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface User {
        _id: string; // Ensure this matches your User model
        username: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
        gender?: string;
        ssn?: number;
        phone_number?: string;
        createdAt: string;
        updatedAt: string;
        accessToken: string; // Add accessToken
        refreshToken: string; // Add refreshToken
        userId: string; // Add userId property
    }

    interface Session extends DefaultSession {
        user: User;
        accessToken: string; // Add accessToken to session
        refreshToken: string; // Add refreshToken to session
        userId: string; // Add userId to session
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user: User;
        accessToken: string; // Add accessToken to JWT
        refreshToken: string; // Add refreshToken to JWT
        userId: string; // Add userId to JWT
    }
}
