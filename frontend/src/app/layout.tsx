import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aysel Detalles',
  description: 'Sistema POS - Tienda Aysel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
