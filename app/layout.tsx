import type { Metadata } from 'next'
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
        {/* Rewardful affiliate tracking — the exact snippet, rendered as raw
            tags in <head> so Rewardful's install detector recognizes it
            (their setup checks for the snippet in the document head). The stub
            queue must precede the async loader. rw.js reads the API key from
            data-rewardful and sets window.Rewardful.referral, which the
            checkout flow passes to Stripe as client_reference_id. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');",
          }}
        />
        <script async src="https://r.wdfl.co/rw.js" data-rewardful="46e3d0"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
