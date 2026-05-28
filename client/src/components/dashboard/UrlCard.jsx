import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { copyToClipboard, formatNumber, timeAgo, truncateUrl, getDomain } from '../../utils/helpers';
import QRModal from './QRModal';
import toast from 'react-hot-toast';

const UrlCard = ({ url, onDelete }) => {
  const navigate   = useNavigate();
  const [copied, setCopied]     = useState(false);
  const [qrOpen, setQrOpen]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  const shortUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${url.shortCode}`;
  const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

  const handleCopy = async () => {
    const ok = await copyToClipboard(shortUrl);
    if (ok) {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this link? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDelete(url._id);
      toast.success('Link deleted');
    } catch {
      toast.error('Failed to delete link');
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="glass-hover rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Favicon + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src={`https://www.google.com/s2/favicons?domain=${getDomain(url.originalUrl)}&sz=32`}
              alt=""
              className="w-5 h-5"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors font-mono"
              >
                /{url.shortCode}
              </a>
              {isExpired ? (
                <span className="badge-danger">Expired</span>
              ) : (
                <span className="badge-success">Active</span>
              )}
              {url.customAlias && <span className="badge-purple">Custom</span>}
            </div>
            <p className="text-xs text-gray-500 truncate">{truncateUrl(url.originalUrl)}</p>
            <p className="text-xs text-gray-600 mt-1">{timeAgo(url.createdAt)}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-sm">
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-white font-semibold">{formatNumber(url.clicks)}</span>
            <span className="text-gray-500 text-xs">clicks</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            onClick={handleCopy}
            title="Copy short URL"
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              copied ? 'bg-emerald-500/20 text-emerald-400' : 'glass text-gray-400 hover:text-white'
            }`}
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* QR code */}
          <button
            onClick={() => setQrOpen(true)}
            title="Show QR code"
            className="w-8 h-8 flex items-center justify-center rounded-lg glass text-gray-400 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>

          {/* Analytics */}
          <button
            onClick={() => navigate(`/dashboard/analytics/${url._id}`)}
            title="View analytics"
            className="w-8 h-8 flex items-center justify-center rounded-lg glass text-gray-400 hover:text-purple-400 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete link"
            className="w-8 h-8 flex items-center justify-center rounded-lg glass text-gray-400 hover:text-red-400 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <QRModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        shortUrl={shortUrl}
        title={`QR for /${url.shortCode}`}
      />
    </>
  );
};

export default UrlCard;
