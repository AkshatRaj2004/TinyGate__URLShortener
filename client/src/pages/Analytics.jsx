import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlAPI } from '../api/url';
import ClicksChart from '../components/charts/ClicksChart';
import DoughnutChart from '../components/charts/DoughnutChart';
import BarChart from '../components/charts/BarChart';
import { Spinner } from '../components/ui/Loader';
import { formatNumber, formatDateTime, truncateUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

const MetaCard = ({ label, value, icon, color }) => (
  <div className="glass rounded-xl p-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  </div>
);

const Analytics = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await urlAPI.getAnalytics(id);
        setData(res.data.data);
      } catch {
        toast.error('Failed to load analytics');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!data) return null;

  const shortUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${data.shortCode}`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back button + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 flex items-center justify-center rounded-xl glass text-gray-400 hover:text-white transition-all flex-shrink-0 mt-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white mb-1">Link Analytics</h1>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-purple-400 font-mono hover:text-purple-300 transition-colors"
            >
              /{data.shortCode}
            </a>
            <span className="text-gray-600">→</span>
            <span className="text-sm text-gray-500 truncate max-w-xs">{truncateUrl(data.originalUrl)}</span>
          </div>
        </div>
      </div>

      {/* Meta stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetaCard
          label="Total Clicks"
          value={formatNumber(data.totalClicks)}
          color="bg-purple-500/15 text-purple-400"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <MetaCard
          label="Unique Browsers"
          value={Object.keys(data.byBrowser || {}).length}
          color="bg-indigo-500/15 text-indigo-400"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          }
        />
        <MetaCard
          label="Device Types"
          value={Object.keys(data.byDevice || {}).length}
          color="bg-emerald-500/15 text-emerald-400"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />
        <MetaCard
          label="Operating Systems"
          value={Object.keys(data.byOs || {}).length}
          color="bg-amber-500/15 text-amber-400"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Clicks over time chart */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Clicks Over Time</h2>
        <ClicksChart clicksOverTime={data.clicksOverTime || {}} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass rounded-2xl p-6">
          <DoughnutChart data={data.byDevice} label="By Device" />
        </div>
        <div className="glass rounded-2xl p-6">
          <DoughnutChart data={data.byBrowser} label="By Browser" />
        </div>
        <div className="glass rounded-2xl p-6">
          <BarChart data={data.byOs} label="By OS" />
        </div>
      </div>

      {/* Recent clicks table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6">
          <h2 className="text-sm font-semibold text-white">Recent Clicks</h2>
        </div>
        {data.recentClicks?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Timestamp', 'Browser', 'OS', 'Device', 'Referrer', 'IP'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentClicks.map((click, i) => (
                  <tr key={i} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">
                      {formatDateTime(click.timestamp)}
                    </td>
                    <td className="px-6 py-3 text-gray-300">{click.browser}</td>
                    <td className="px-6 py-3 text-gray-300">{click.os}</td>
                    <td className="px-6 py-3">
                      <span className={`badge ${
                        click.device === 'mobile' ? 'badge-info' :
                        click.device === 'tablet' ? 'badge-warning' :
                        'badge-purple'
                      }`}>
                        {click.device}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs max-w-[160px] truncate">
                      {click.referrer || 'direct'}
                    </td>
                    <td className="px-6 py-3 text-gray-600 font-mono text-xs">{click.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-14 text-gray-500 text-sm">
            No clicks recorded yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
