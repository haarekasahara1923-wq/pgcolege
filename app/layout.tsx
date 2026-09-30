import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://prathvigroup.edu.in"),
  title: {
    default: "Prathvi Group of College | Gwalior, Madhya Pradesh",
    template: "%s | Prathvi Group of College",
  },
  description:
    "Prathvi Group of College – a premier educational institution in Gwalior, MP offering MBA, B.Ed, D.Ed, Law, ITI, B.Pharma, D.Pharma and more. Vill. Khureri, Behind Devraj Hospital, Morar, Gwalior.",
  keywords: ["Prathvi Group of College", "Gwalior", "MBA", "B.Ed", "Law", "Pharmacy", "Madhya Pradesh", "Education"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Prathvi Group of College",
    title: "Prathvi Group of College | Gwalior, Madhya Pradesh",
    description: "Premier educational institution in Gwalior, MP offering professional degree courses.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prathvi Group",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#172554" />
      </head>
      <body className="overflow-x-hidden bg-slate-50">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
