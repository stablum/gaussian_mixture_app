import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gaussian Mixture Explorer',
  description: 'Interactive tool for exploring 1D Gaussian mixture models and the EM algorithm',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}