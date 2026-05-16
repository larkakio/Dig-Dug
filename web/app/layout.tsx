import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
});

const techMono = Share_Tech_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dig-dug.vercel.app";

const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? "6a083421bc175abcdd5651f1";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Neon Dig Dug",
  description:
    "Cyberpunk Dig Dug arcade on Base — swipe to dig, pump enemies, sync daily on-chain.",
  icons: {
    icon: "/app-icon.jpg",
    apple: "/app-icon.jpg",
  },
  openGraph: {
    title: "Neon Dig Dug",
    images: [{ url: "/app-thumbnail.jpg", width: 1200, height: 628 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${techMono.variable} h-full`}
    >
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body className="min-h-dvh overflow-x-hidden bg-[#050508] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
