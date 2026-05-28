import { useState, useEffect, useMemo } from 'react';
import { urlAPI } from '../api/url';
import UrlCard from '../components/dashboard/UrlCard';
import { Spinner } from '../components/ui/Loader';
import toast from 'react-hot-toast';

const Links = () => {
  const [urls, setUrls]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);

  const LIMIT = 15;

  const fetchUrls = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await urlAPI.getAll({ page: p, limit: LIMIT });
      setUrls(data.data || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUrls(page); }, [page]);

  const handleDelete = async (id) => {
    await urlAPI.deleteUrl(id);
    setUrls((prev) => prev.filter((u) => u._id !== id));
    setTotal((t) => t - 1);
  };

  const filtered = useMemo(() => {
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
        return u.originalUrl.toLowerCase().includes(q) || u.shortCode.toLowerCase().includes(q);
      });
  }, [urls, filter, search]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">My Links</h1>
        <p className="text-gray-400 text-sm mt-1">{total} total links in your account</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by URL or short code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass pl-9 text-sm"
          />
        </div>
        <div className="flex items-center glass rounded-xl p-1 gap-1">
          {['all', 'active', 'expired'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
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
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-2xl text-center">
          <p className="text-gray-400 font-medium">{search ? 'No results found' : 'No links yet'}</p>
          <p className="text-gray-600 text-sm mt-1">{search ? 'Try another search term' : 'Go to dashboard to create your first link'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((url) => (
            <UrlCard key={url._id} url={url} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost text-sm px-4 py-2 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-gray-500 text-sm px-3">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="btn-ghost text-sm px-4 py-2 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Links;
