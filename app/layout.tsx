import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Montessori Navigator — A Prepared Environment for Parents',
  description: 'AI-powered Montessori guidance for parents and homeschooling families. Curriculum planning, child development tracking, and personalized support grounded in Montessori philosophy.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
