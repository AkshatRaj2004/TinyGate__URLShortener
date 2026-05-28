import { useState, useEffect, useMemo } from 'react';
import { urlAPI } from '../api/url';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import ShortenForm from '../components/dashboard/ShortenForm';
import UrlCard from '../components/dashboard/UrlCard';
import { Spinner } from '../components/ui/Loader';
import toast from 'react-hot-toast';

const STAT_CONFIGS = [
  {
    key: 'total',
    label: 'Total Links',
    gradient: 'linear-gradient(135deg, rgba(147,51,234,0.15), rgba(99,102,241,0.08))',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    key: 'clicks',
    label: 'Total Clicks',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.08))',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    key: 'active',
    label: 'Active Links',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.08))',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'expired',
    label: 'Expired Links',
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(245,158,11,0.08))',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const Dashboard = () => {
  const { user } = useAuth();

  const [urls, setUrls]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all'); // all | active | expired

  const fetchUrls = async () => {
    try {
      const { data } = await urlAPI.getAll({ limit: 50 });
      setUrls(data.data || []);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUrls(); }, []);

  const handleCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  const handleDelete = async (id) => {
    await urlAPI.deleteUrl(id);
    setUrls((prev) => prev.filter((u) => u._id !== id));
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const active  = urls.filter((u) => !u.expiresAt || new Date(u.expiresAt) > now);
    const expired = urls.filter((u) => u.expiresAt && new Date(u.expiresAt) <= now);
    const clicks  = urls.reduce((sum, u) => sum + (u.clicks || 0), 0);
    return { total: urls.length, clicks, active: active.length, expired: expired.length };
  }, [urls]);

  // ── Filtered + searched list ──────────────────────────────────────────────
  const filteredUrls = useMemo(() => {
    const now = new Date();
    return urls
      .filter((u) => {
        if (filter === 'active')  return !u.expiresAt || new Date(u.expiresAt) > now;
        if (filter === 'expired') return u.expiresAt && new Date(u.expiresAt) <= now;
        return true;
      })
      .filter((u) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          u.originalUrl.toLowerCase().includes(q) ||
          u.shortCode.toLowerCase().includes(q)
        );
      });
  }, [urls, filter, search]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">Here&apos;s an overview of your links.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIGS.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={stats[s.key]}
            icon={s.icon}
            gradient={s.gradient}
          />
        ))}
      </div>

      {/* Shorten form */}
      <ShortenForm onCreated={handleCreated} />

      {/* Links list */}
      <div>
        {/* List header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <h2 className="text-base font-semibold text-white flex-1">Your Links</h2>

          {/* Search */}
          <div className="relative sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search links…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-glass pl-9 text-sm py-2"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center glass rounded-xl p-1 gap-1">
            {['all', 'active', 'expired'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 glass rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-4 text-gray-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">
              {search ? 'No links match your search' : 'No links yet'}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {search ? 'Try a different search term' : 'Shorten your first URL above'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUrls.map((url) => (
              <UrlCard key={url._id} url={url} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
