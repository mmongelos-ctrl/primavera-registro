import "./globals.css";

export const metadata = {
  title: "Primavera – Registro de Campo",
  description: "Registro ganadero para Estancia Primavera – 7 Palmas. Por De Raíz.",
  manifest: "/manifest.json",
  themeColor: "#1e3a5f",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
