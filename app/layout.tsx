import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdminProvider from "./layouts/AdminProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flowin Admin Panel - PDAM Tirta Daroy",
  description: "Panel Administrasi Manajemen Air Flowin untuk 14.000 pengguna PDAM Tirta Daroy Banda Aceh",
  icons: {
    icon: "/assets/logo/Aqualink_2.png",
    shortcut: "/assets/logo/Aqualink_2.png",
    apple: "/assets/logo/Aqualink_2.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/assets/logo/Aqualink_2.png",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}