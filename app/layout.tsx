import { PageTransition } from "@/components/PageTransition";
import { siteUrl } from "@/lib/i18n";
import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Daphni Georgolidis",
    template: "%s | Daphni Georgolidis"
  },
  description:
    "Official website for comedian Daphni Georgolidis with dark humor voice, reels, and booking contact.",
  openGraph: {
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Daphni Georgolidis"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.svg"]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="bg-white font-body text-teal antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
