import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "RPOC - Workforce Compliance Control Tower",
  description: "Enterprise workforce compliance management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className="antialiased h-full"
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
