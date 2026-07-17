import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Montessori Family Alliance — A Prepared Environment for Parents',
  description: 'AI-powered Montessori guidance for parents and homeschooling families. Curriculum planning, child development tracking, and personalized support grounded in Montessori philosophy.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Rewardful affiliate tracking. The stub queue must load before the
            main script (beforeInteractive → head). The main script sets
            window.Rewardful.referral, which we pass into Stripe Checkout as
            client_reference_id so Rewardful can attribute conversions. */}
        <Script id="rewardful-queue" strategy="beforeInteractive">
          {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
        </Script>
        <Script
          id="rewardful-main"
          src="https://r.wdfl.co/rw.js"
          data-rewardful="46e3d0"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
