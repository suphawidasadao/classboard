import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/user";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;

        await connectMongoDB();
        const user = await User.findOne({ email });
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          picture: user.profileImage,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      // ⚡ Credentials login
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name || "";
        token.picture = user.picture || "";
      }

      // ⚡ Google login
      if (account?.provider === "google") {
        await connectMongoDB();

        // ลองดึงรูปจาก profile
        const profileImageFromGoogle =
          token.picture ||
          profile?.picture ||
          (profile?.photos && profile.photos[0]?.value) ||
          "";

        const existingUser = await User.findOne({ email: token.email });

        if (!existingUser) {
          const newUser = await User.create({
            email: token.email,
            name: token.name || profile?.name || "",
            profileImage: profileImageFromGoogle,
            role: "user",
            password: "",
          });

          token.id = newUser._id.toString();
          token.role = newUser.role;
          token.name = newUser.name;
          token.picture = newUser.profileImage;
        } else {
          token.id = existingUser._id.toString();
          token.role = existingUser.role;
          token.name = existingUser.name;
          token.picture = existingUser.profileImage || "/default-profile.png";
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.email = token.email;
      session.user.name = token.name || "";
      session.user.image = token.picture || "/default-profile.png";
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
