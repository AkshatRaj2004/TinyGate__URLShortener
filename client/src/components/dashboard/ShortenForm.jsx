import { useState } from 'react';
import { urlAPI } from '../../api/url';
import toast from 'react-hot-toast';
import { Spinner } from '../ui/Loader';

const ShortenForm = ({ onCreated }) => {
  const [url, setUrl]               = useState('');
  const [alias, setAlias]           = useState('');
  const [expiry, setExpiry]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [advanced, setAdvanced]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const payload = { originalUrl: url.trim() };
      if (alias.trim())  payload.customAlias = alias.trim();
      if (expiry.trim()) payload.expiresAt    = expiry;

      const { data } = await urlAPI.shorten(payload);
      toast.success('Link shortened!');
      onCreated?.(data.data);
      setUrl(''); setAlias(''); setExpiry('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-white">Shorten a new link</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main URL input */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </span>
            <input
              type="url"
              placeholder="https://your-long-url.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="input-glass pl-10"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-accent px-6 flex-shrink-0">
            {loading ? <Spinner size="sm" /> : 'Shorten'}
          </button>
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setAdvanced((p) => !p)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${advanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Advanced options
        </button>

        {advanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-slide-down">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Custom alias (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">/</span>
                <input
                  type="text"
                  placeholder="my-link"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="input-glass pl-6 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Expiry date (optional)</label>
              <input
                type="datetime-local"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="input-glass text-sm"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ShortenForm;
