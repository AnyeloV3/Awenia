import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Awenia — Administración de crochet',
  description: 'Sistema local de administración, precios, ventas, caja e inventario para Wendy.',
  generator: 'Awenia / SECC',
  robots: { index: false, follow: false },
}
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf7f4' },
    { media: '(prefers-color-scheme: dark)', color: '#1c171c' },
  ],
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>
}
