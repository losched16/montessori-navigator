'use client'

import AppHeader from './AppHeader'
import DesktopNavRail from './DesktopNavRail'
import MobileBottomNav from './MobileBottomNav'

// Presentational app shell for the parent experience: design tokens, header,
// desktop rail, mobile bottom nav, and the main content frame. All business
// logic (auth, gating, child context) lives in app/dashboard/layout.tsx.
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen mfa-parent mfa-app bg-[color:var(--mfa-canvas)]">
      {/* Typography + color tokens for the parent app.
          - .mfa-app holds the Phase-1 semantic MFA design tokens (new shell,
            Home, Explore, More and all components under components/app|family).
          - .mfa-parent / .mfa-editorial / .mfa-body are the pre-existing
            editorial tokens still used by older parent screens (resources,
            library reader, etc.). Keep both until those screens migrate. */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700;6..72,800&display=swap');
        .mfa-app {
          --mfa-canvas: #F8F6F1;
          --mfa-surface: #FFFFFF;
          --mfa-surface-warm: #F1ECE3;
          --mfa-surface-sage: #E9EEE5;

          --mfa-ink: #22221F;
          --mfa-ink-secondary: #68665F;
          --mfa-ink-muted: #918F88;

          --mfa-purple: #4A2C82;
          --mfa-purple-soft: #EEE8F6;

          --mfa-clay: #B96943;
          --mfa-clay-soft: #F5E8E0;

          --mfa-sage: #6C8A5C;
          --mfa-sage-soft: #E9EEE5;

          --mfa-forest: #344A3A;
          --mfa-ochre: #C79543;

          --mfa-border: rgba(45, 40, 30, .10);

          --mfa-serif: 'Newsreader', 'Cormorant Garamond', Georgia, serif;
          --mfa-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

          font-family: var(--mfa-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        /* Abigail assistant responses — safe markdown from renderMarkdown().
           "## Try this"-style headings become quiet section eyebrows so the
           guidance reads as a structured card, not a wall of chat text. */
        .abigail-md {
          font-size: 16px;
          line-height: 1.65;
          color: var(--mfa-ink);
          overflow-wrap: break-word;
        }
        .abigail-md p { margin: 0 0 0.85em; }
        .abigail-md p:last-child { margin-bottom: 0; }
        .abigail-md h1, .abigail-md h2, .abigail-md h3, .abigail-md h4 {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--mfa-clay);
          margin: 1.5em 0 0.5em;
        }
        .abigail-md strong { font-weight: 650; color: var(--mfa-ink); }
        .abigail-md em { font-style: italic; }
        .abigail-md ul, .abigail-md ol { margin: 0 0 0.85em; padding-left: 1.3em; }
        .abigail-md ul { list-style: disc; }
        .abigail-md ol { list-style: decimal; }
        .abigail-md li { margin-bottom: 0.35em; }
        .abigail-md a {
          color: var(--mfa-purple);
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
        }
        .abigail-md blockquote {
          margin: 0.85em 0;
          padding-left: 0.9em;
          border-left: 3px solid var(--mfa-sage);
          color: var(--mfa-ink-secondary);
          font-style: italic;
        }
        .abigail-md code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.88em;
          background: var(--mfa-surface-warm);
          padding: 0.1em 0.35em;
          border-radius: 4px;
        }

        .mfa-parent {
          --ink: #1d1d1f;
          --ink-secondary: #6e6e73;
          --ink-muted: #86868b;
          --separator: #d2d2d7;
          --surface: #ffffff;
          --surface-elevated: #fbfbfd;
          --accent: #4a2c82;
          --accent-warm: #c97b3b;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --font-serif: 'Newsreader', 'Cormorant Garamond', Georgia, serif;
        }
        .mfa-editorial {
          font-family: var(--font-sans);
          color: var(--ink);
          font-feature-settings: 'ss01', 'cv11';
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .mfa-editorial h1, .mfa-editorial h2, .mfa-editorial h3,
        .mfa-editorial .serif {
          font-family: var(--font-serif);
          letter-spacing: -0.02em;
          /* No hard-coded color — headings inherit ink from .mfa-editorial by
             default, but stay white when placed inside a text-white card
             (e.g. the gradient hero). A forced color here would override
             Tailwind's text-white via higher selector specificity. */
        }
        /* Anchors don't inherit color (UA stylesheet), so plain links would go
           browser-blue. Default them to ink; any link with an explicit Tailwind
           text color (text-warm-600 etc.) wins via class specificity. */
        .mfa-editorial a:not([class*="text-"]) { color: var(--ink); }

        /* Editorial body typography — applied via .mfa-body to rendered
           markdown (dangerouslySetInnerHTML output on resource detail pages).
           Lives here in the shell because the detail pages are Server
           Components and can't use styled-jsx. */
        .mfa-body {
          font-family: var(--font-serif);
          font-size: 19px;
          line-height: 1.62;
          color: var(--ink);
        }
        .mfa-body p { margin: 0 0 1.35em; }
        .mfa-body p:first-of-type::first-letter { font-weight: 700; }
        .mfa-body h1, .mfa-body h2, .mfa-body h3 {
          font-family: var(--font-serif);
          color: var(--ink);
          letter-spacing: -0.015em;
          line-height: 1.15;
          margin: 2em 0 0.6em;
        }
        .mfa-body h1 { font-size: 36px; font-weight: 800; }
        .mfa-body h2 { font-size: 28px; font-weight: 700; }
        .mfa-body h3 { font-size: 22px; font-weight: 700; }
        .mfa-body a {
          color: var(--ink);
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }
        .mfa-body a:hover { opacity: 0.7; }
        .mfa-body strong { font-weight: 700; color: var(--ink); }
        .mfa-body em { font-style: italic; }
        .mfa-body code {
          font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
          font-size: 0.88em;
          background: #f5f5f7;
          padding: 0.15em 0.4em;
          border-radius: 4px;
        }
        .mfa-body ul, .mfa-body ol { margin: 0 0 1.35em; padding-left: 1.4em; }
        .mfa-body li { margin-bottom: 0.4em; }
        .mfa-body blockquote {
          font-size: 22px;
          line-height: 1.45;
          font-style: italic;
          font-weight: 500;
          margin: 1.6em 0;
          padding-left: 1.2em;
          border-left: 3px solid var(--accent-warm);
          color: var(--ink);
        }
        .mfa-body u { text-decoration: underline; }
        .mfa-body img {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
          display: block;
          margin: 1.5em auto;
        }
      `}</style>

      <AppHeader />
      <DesktopNavRail />

      {/* Main content — offset for the desktop rail. Padding must stay
          p-4 sm:p-6: several pages (chat, resources) use matching negative
          margins to go full-bleed, and chat's height math depends on it. */}
      <div className="sm:pl-20">
        <main className="p-4 sm:p-6 min-w-0">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}
