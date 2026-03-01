import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WOC Simulator — War Oil Crisis",
  description:
    "Oil price simulation under conflict scenarios. Ruiz Estrada et al. (2020).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0d1117] text-[#c9d1d9] antialiased">
        {children}
      </body>
    </html>
  );
}
