import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSI Intel Platform",
  description: "ระบบวิเคราะห์คดีสอบสวน - Department of Special Investigation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-900 text-slate-50`}>
        {children}
      </body>
    </html>
  );
}
