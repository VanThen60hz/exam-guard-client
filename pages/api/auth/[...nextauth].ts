import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUser } from "../../../helpers/api/user-api";
import { User } from "../../../models/user-models";

// Cấu hình NextAuth
export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt", // Sử dụng JWT để quản lý phiên đăng nhập
    },

    providers: [
        // Cấu hình Credentials Provider
        CredentialsProvider({
            type: "credentials",
            credentials: {},
            authorize: async (credentials, req) => {
                try {
                    // Lấy thông tin đăng nhập từ form
                    const { id, password } = credentials as { id: string; password: string };

                    // Gọi API để kiểm tra user trong cơ sở dữ liệu
                    const response = await getUser(id, password);

                    // Kiểm tra phản hồi API
                    if (response?.status === 200 && response?.metadata?.user && response?.metadata?.tokens) {
                        const { user, tokens } = response.metadata;

                        // Trả về thông tin user và tokens để NextAuth lưu lại
                        return {
                            ...user,
                            accessToken: tokens.accessToken,
                            refreshToken: tokens.refreshToken,
                            userId: user._id, // Add userId here
                        };
                    }

                    // Nếu không tìm thấy user, trả về null (NextAuth sẽ hiểu là đăng nhập thất bại)
                    return null;
                } catch (e) {
                    // Xử lý lỗi nếu có vấn đề khi authorize
                    throw new Error(e instanceof Error ? e.message : "Login Failed!");
                }
            },
        }),
    ],

    pages: {
        signIn: "/auth/login", // Trang đăng nhập tuỳ chỉnh
    },

    callbacks: {
        // Callback cho session
        session: async ({ session, token }) => {
            // Thêm thông tin user từ token vào session
            session.user = token.user;
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            session.userId = token.userId; // Add userId to session
            return session; // Trả về session đã được cập nhật
        },

        // Callback cho JWT
        jwt: async ({ token, user }) => {
            // Nếu có user (sau khi đăng nhập thành công), lưu thông tin vào token
            if (user) {
                token.user = {
                    _id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.userId = user.userId; // Add userId to token
            }
            return token; // Trả về token đã được cập nhật
        },
    },

    secret: process.env.AUTH_SECRET, // Đảm bảo biến môi trường này được cấu hình
};

export default NextAuth(authOptions);
