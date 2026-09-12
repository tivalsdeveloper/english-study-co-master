import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./otp.css";
import "./group-room.css";

export const metadata: Metadata = {
  title: "English Study Co.Master",
  description: "Learn English, teach with confidence, and grow together.",
  other: {
    "codex-preview": "development",
    monetag: "2390b319b0306a2fdad9f23cfc567ecc",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="279691"
          data-cfasync="false"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
