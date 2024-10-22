import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Navbar } from "./_components/layout/Navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Full stack app",
  description: "Full stack social media app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <Navbar />
          {children}
        </TRPCReactProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
