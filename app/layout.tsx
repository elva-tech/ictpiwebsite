import "./tailwind.css";
import { AuthProvider } from "@/context/AuthContext";
import { UnifrakturCook, Poppins } from "next/font/google";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${unifraktur.variable} ${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-[family-name:var(--font-poppins)] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
