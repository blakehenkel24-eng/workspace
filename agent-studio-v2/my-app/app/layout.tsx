import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
  title: "Agent Studio v2",
  description: "Multi-Agent Orchestration Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0D0D0D]">
        <Navigation />
        {/* Mobile: Add padding-top for header, Desktop: Add padding-left for sidebar */}
        <div className="pt-16 lg:pt-0 lg:pl-64">
          {children}
        </div>
      </body>
    </html>
  );
}
