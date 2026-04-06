import { useAnalytics, useVisitorStats, useDeviceStats } from '../../hooks/useAnalytics';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Badge from '../../components/ui/Badge';

const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const { data: overview, isLoading } = useAnalytics();
  const { data: visitors } = useVisitorStats(30);
  const { data: devices } = useDeviceStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-bg-hover rounded w-24 mb-4" />
              <div className="h-8 bg-bg-hover rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-txt-primary mb-2">Dashboard</h1>
        <p className="text-txt-secondary">Overview of your blog's performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Visits" value={overview?.totalVisits?.toLocaleString() || '0'} icon="👁" />
        <StatCard label="Unique Visitors" value={overview?.uniqueVisitors?.toLocaleString() || '0'} icon="🧑‍💻" />
        <StatCard label="Total Likes" value={overview?.totalLikes?.toLocaleString() || '0'} icon="♥" />
        <StatCard label="Total Comments" value={overview?.totalComments?.toLocaleString() || '0'} icon="💬" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-txt-primary mb-4">Visitor Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={visitors || []}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ background: '#16161f', border: '1px solid #1e1e2e', borderRadius: '8px', color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="visits" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="unique" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-semibold text-txt-primary mb-4">Device Breakdown</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={devices || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="device"
                >
                  {(devices || []).map((entry, index) => (
                    <Cell key={entry.device} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#16161f', border: '1px solid #1e1e2e', borderRadius: '8px', color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {(devices || []).map((d, i) => (
              <div key={d.device} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-sm text-txt-secondary capitalize">{d.device}: {d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold text-txt-primary mb-4">Top Posts</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-txt-muted border-b border-bg-border">
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium text-right">Views</th>
              <th className="pb-3 font-medium text-right">Likes</th>
              <th className="pb-3 font-medium text-right">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-border">
            {(overview?.topPosts || []).map((post) => (
              <tr key={post.slug} className="hover:bg-bg-hover transition-colors">
                <td className="py-3 text-txt-primary">{post.title}</td>
                <td className="py-3 text-right text-txt-secondary">{post.views.toLocaleString()}</td>
                <td className="py-3 text-right text-txt-secondary">{post.likes.toLocaleString()}</td>
                <td className="py-3 text-right text-txt-secondary">-</td>
              </tr>
            ))}
            {(!overview?.topPosts || overview.topPosts.length === 0) && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-txt-muted">No posts yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card p-6 hover:border-accent/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-txt-muted text-xs font-medium uppercase tracking-wide">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-display font-semibold text-txt-primary">{value}</p>
    </div>
  );
}
