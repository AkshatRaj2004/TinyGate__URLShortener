import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant Shortening',
    desc: 'Generate short, memorable links in milliseconds with our blazing-fast API.',
    gradient: 'from-purple-500/20 to-violet-500/20',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Deep Analytics',
    desc: 'Track every click with browser, device, OS, and geographic breakdowns.',
    gradient: 'from-indigo-500/20 to-blue-500/20',
    border: 'border-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    title: 'QR Code Generator',
    desc: 'Instantly generate downloadable QR codes for every shortened link.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    title: 'Custom Aliases',
    desc: 'Create branded short links with your own custom alias slugs.',
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/20',
    iconColor: 'text-pink-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Link Expiry',
    desc: 'Set automatic expiry dates so your links deactivate exactly when you need.',
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Enterprise Security',
    desc: 'Secured with JWT auth, rate limiting, helmet, and CORS protection.',
    gradient: 'from-cyan-500/20 to-sky-500/20',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
];

const Home = () => (
  <div className="min-h-screen">
    <Navbar />

    {/* ── Hero ────────────────────────────────────────────────────────────── */}
    <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-indigo-700/15 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-violet-700/10 rounded-full blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-500/20 text-sm text-purple-300 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          Production-ready URL Shortener
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 animate-slide-up">
          Shorten Links.{' '}
          <span className="text-gradient">Track Everything.</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 text-balance animate-slide-up animation-delay-200">
          Tiny Gate is a blazing-fast URL shortener with real-time analytics,
          QR code generation, custom aliases, and enterprise-grade security — all in one platform.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-400">
          <Link to="/register" className="btn-accent text-base px-8 py-3.5 shadow-accent">
            Start for Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link to="/login" className="btn-ghost text-base px-8 py-3.5">
            Sign In
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-xs text-gray-600 mt-8 animate-fade-in animation-delay-600">
          No credit card required &nbsp;·&nbsp; Free forever plan &nbsp;·&nbsp; 99.9% uptime
        </p>
      </div>

      {/* Demo card */}
      <div className="max-w-2xl mx-auto mt-16 relative z-10 animate-slide-up animation-delay-400">
        <div className="glass rounded-2xl p-5 shadow-glass-lg border-accent-glow">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent rounded-t-2xl" />
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">Try it now</p>
          <div className="flex gap-3">
            <input
              readOnly
              defaultValue="https://www.example.com/very/long/path/that/nobody/wants-to-share"
              className="input-glass flex-1 text-sm text-gray-400"
            />
            <Link to="/register" className="btn-accent text-sm px-5 flex-shrink-0">Shorten</Link>
          </div>
          <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/3 border border-white/6">
            <span className="text-xs text-gray-500">Short URL:</span>
            <span className="text-sm text-purple-400 font-mono">tinygate.app/xK9pQ2r</span>
            <span className="ml-auto badge-success">Active</span>
          </div>
        </div>
      </div>
    </section>

    {/* ── Features ────────────────────────────────────────────────────────── */}
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to manage links
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Packed with powerful features that help marketers, developers, and teams
            work smarter with their links.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`glass-hover rounded-2xl p-6 bg-gradient-to-br ${f.gradient} border ${f.border}`}
            >
              <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center mb-4 ${f.iconColor}`}>
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative glass rounded-3xl p-10 sm:p-14 text-center overflow-hidden border-accent-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-indigo-900/20 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to shorten smarter?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join and start tracking your links with powerful analytics today. Free to start.
            </p>
            <Link to="/register" className="btn-accent text-base px-10 py-3.5 shadow-accent-lg">
              Create Free Account →
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* ── Footer ──────────────────────────────────────────────────────────── */}
    <footer className="border-t border-white/5 py-8 px-4 text-center text-sm text-gray-600">
      © {new Date().getFullYear()} Tiny Gate. Built with Node.js, React &amp; MongoDB.
    </footer>
  </div>
);

export default Home;
