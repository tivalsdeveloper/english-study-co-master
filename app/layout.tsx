import type { Metadata } from "next";
import Script from "next/script";
import AccountTools from "./account-tools";
import "./globals.css";
import "./otp.css";
import "./group-room.css";
import "./account-tools.css";

export const metadata: Metadata = {
  title: "English Study Co.Master",
  description: "Learn English, teach with confidence, and grow together.",
  other: {
    "codex-preview": "development",
    monetag: "2390b319b0306a2fdad9f23cfc567ecc",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
        <AccountTools />
        <Script src="/chat-enhancements.js" strategy="afterInteractive" />
        <Script
          src="/restore-missing-features.js"
          strategy="afterInteractive"
        />
        <Script src="/login-forgot-password.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
