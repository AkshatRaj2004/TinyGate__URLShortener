export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10', xl: 'w-16 h-16' };
  return (
    <div className={`${sizes[size]} ${className} relative`}>
      <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-2 border-purple-500/20" />
      <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
    </div>
    <p className="text-gray-500 text-sm animate-pulse">Loading Tiny Gate…</p>
  </div>
);
