/**
 * Required environment variables:
 * GOOGLE_CLIENT_ID
 * GOOGLE_CLIENT_SECRET
 * NEXTAUTH_SECRET
 * NEXTAUTH_URL
 */
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
    console.warn('Missing required environment variables for NextAuth');
    throw new Error('Server misconfiguration. Missing required environment variables.');
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (
        profile?.email_verified &&
        profile.email.endsWith('@grastontechnique.com')
      ) {
        return true;
      }
      return false;
    },
  },
});