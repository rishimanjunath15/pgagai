// ============================================
// ROOT LAYOUT - Wraps the entire app
// ============================================
import type { Metadata } from "next";
import ReduxProvider from "@/shared/components/providers/ReduxProvider";
import AuthProvider from "@/shared/components/providers/AuthProvider";
import I18nProvider from "@/shared/components/providers/I18nProvider";
import { auth } from "@/features/auth/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personalized Content Dashboard",
  description: "Track and interact with personalized news, movies, and social content",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch session server-side so AuthProvider can pre-populate without an extra round trip
  const session = await auth();

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {/* Auth → Redux → i18n — order matters: auth wraps all, i18n is outermost client wrapper */}
        <AuthProvider session={session}>
          <ReduxProvider>
            <I18nProvider>{children}</I18nProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
