<<<<<<< HEAD
﻿
import './globals.css';

=======
﻿import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aysel Detalles',
  description: 'Sistema POS - Tienda Aysel',
};

>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
<<<<<<< HEAD
      <body>{children}</body>
=======
      <body suppressHydrationWarning>{children}</body>
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
    </html>
  );
}
