import { formatNumber } from '../../utils/helpers';

const StatCard = ({ label, value, icon, gradient, trend }) => (
  <div
    className="stat-card"
    style={{ '--card-gradient': gradient }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
        style={{ background: gradient?.replace('linear-gradient(135deg,', '').replace(')', '') || 'rgba(147,51,234,0.2)' }}>
        {icon}
      </div>
      {trend !== undefined && (
        <span className={`badge ${trend >= 0 ? 'badge-success' : 'badge-danger'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-white mb-1">{formatNumber(value)}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

export default StatCard;
