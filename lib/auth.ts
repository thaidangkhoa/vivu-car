import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"; //  Import thư viện giải mã

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Số điện thoại", type: "text" },
        password: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Vui lòng nhập đầy đủ thông tin");
        }

        // Tìm user trong DB thật
        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        });

        if (!user || !user.password) {
          throw new Error("Số điện thoại không tồn tại hoặc tài khoản chưa thiết lập mật khẩu");
        }

        //  So sánh mật khẩu bằng bcrypt (Giải quyết lỗi không khớp Hash)
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Mật khẩu không chính xác");
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        //  Bọc lại cẩn thận để chống sập ngầm
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          phone: token.phone as string,
        };
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "vivucar-secret-key-super-secure-2024",
};