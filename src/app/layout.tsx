import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, SITE_URL } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { NoFlashThemeScript } from "@/components/theme/no-flash-script";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — Get website feedback, exactly where it matters`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — Get website feedback, exactly where it matters`,
    description: APP_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Get website feedback, exactly where it matters`,
    description: APP_DESCRIPTION,
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <NoFlashThemeScript />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
