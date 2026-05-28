import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <div className="relative mb-8">
      <p className="text-[8rem] font-black text-gradient leading-none select-none">404</p>
      <div className="absolute inset-0 blur-3xl bg-purple-600/20 -z-10" />
    </div>
    <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
    <p className="text-gray-400 mb-8 max-w-sm">
      The page you&apos;re looking for doesn&apos;t exist or the short link has expired.
    </p>
    <Link to="/" className="btn-accent">Go back home</Link>
  </div>
);

export default NotFound;
