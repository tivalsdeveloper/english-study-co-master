import type { Metadata } from "next";
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
