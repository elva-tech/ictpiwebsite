import "./tailwind.css";
import { AuthProvider } from "@/context/AuthContext";
import { UnifrakturCook, Poppins, Noto_Sans_Devanagari } from "next/font/google";
import { PortalThemeSync } from "@/components/PortalThemeSync";

const unifraktur = UnifrakturCook({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-unifraktur",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  weight: ["400", "600", "700"],
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${unifraktur.variable} ${poppins.variable} ${notoDevanagari.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-[family-name:var(--font-poppins)] antialiased">
        <PortalThemeSync />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
