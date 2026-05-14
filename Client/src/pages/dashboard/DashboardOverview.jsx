import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, ArrowUpRight, PlusCircle, Loader2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { getTier } from "../../constants/pricing";

const TREND_ICONS = { up: "↑", down: "↓", neutral: "→" };
const TREND_COLORS = { up: "text-emerald-400", down: "text-red-400", neutral: "text-zinc-500" };

function StatCard({ label, value, change, trend }) {
    return (
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-colors duration-200">
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-3">{label}</p>
            <p className="text-3xl font-black text-white tracking-tighter mb-1">{value}</p>
            {change && (
                <p className={`text-xs ${TREND_COLORS[trend] || "text-zinc-500"}`}>
                    {TREND_ICONS[trend] || "→"} {change}
                </p>
            )}
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                <p className="text-white text-xs font-bold">{label}</p>
                <p className="text-zinc-400 text-xs">{payload[0].value} responses</p>
            </div>
        );
    }
    return null;
}

function LoadingState() {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </div>
    );
}

function ErrorState({ message, onRetry }) {
    return (
        <div className="text-center py-20">
            <p className="text-zinc-500 text-sm mb-3">{message}</p>
            <button onClick={onRetry} className="text-xs text-white hover:underline">Retry</button>
        </div>
    );
}

export default function DashboardOverview() {
    const { api, ready } = useApi();
    const [analytics, setAnalytics] = useState(null);
    const [activity, setActivity] = useState([]);
    const [plan, setPlan] = useState(null);
    const [polls, setPolls] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!api) return;
        setLoading(true);
        setError(null);
        try {
            const [analyticsRes, activityRes, planRes, pollsRes, trendsRes] = await Promise.all([
                api.analytics.overview(),
                api.user.activity(),
                api.user.plan(),
                api.polls.list(),
                api.analytics.trends(),
            ]);
            setAnalytics(analyticsRes);
            setActivity(activityRes.activity || []);
            setPlan(planRes);
            setPolls(pollsRes.polls || []);
            setTrends(trendsRes.months || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ready) fetchData();
    }, [ready]);

    if (!ready || loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={fetchData} />;

    const totalPolls = polls.length;
    const activePolls = polls.filter((p) => p.status === "active").length;
    const totalResponses = analytics?.totalResponses || 0;
    const completionRate = analytics?.completionRate || 0;
    const tier = plan ? getTier(plan.plan) : null;

    const stats = [
        { label: "Total Polls", value: String(totalPolls), change: null, trend: "neutral" },
        { label: "Active Polls", value: String(activePolls), change: null, trend: "neutral" },
        { label: "Total Responses", value: totalResponses.toLocaleString(), change: null, trend: "up" },
        { label: "Completion Rate", value: `${completionRate}%`, change: null, trend: "up" },
    ];

    // Build chart data from trends
    const chartData = trends.map((t) => ({ day: t.month, responses: t.responses }));

    // Format activity time
    const formatTime = (isoString) => {
        const d = new Date(isoString);
        const diff = Date.now() - d.getTime();
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div>
            {/* header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
                    <p className="text-zinc-500 text-sm mt-1">Overview of your polling activity</p>
                </div>
                <Link
                    to="/dashboard/create"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all duration-150"
                >
                    <PlusCircle size={16} /> Create Poll
                </Link>
            </div>

            {/* stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            {/* chart + activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* response trend chart */}
                <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-white text-sm font-bold">Response Trend</h3>
                            <p className="text-zinc-500 text-xs">Monthly overview</p>
                        </div>
                        <TrendingUp size={16} className="text-zinc-500" />
                    </div>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#71717a", fontSize: 11 }}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="responses"
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    fill="url(#responseGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[220px] text-zinc-600 text-sm">
                            No trend data yet
                        </div>
                    )}
                </div>

                {/* recent activity */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <h3 className="text-white text-sm font-bold mb-4">Recent Activity</h3>
                    {activity.length === 0 ? (
                        <p className="text-zinc-600 text-xs">No activity yet</p>
                    ) : (
                        <div className="space-y-3">
                            {activity.slice(0, 5).map((a) => (
                                <div key={a.id} className="flex items-start gap-3">
                                    <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                        a.type === "response" ? "bg-emerald-400" :
                                        a.type === "create" ? "bg-blue-400" :
                                        a.type === "publish" ? "bg-white" :
                                        "bg-zinc-600"
                                    }`} />
                                    <div className="min-w-0">
                                        <p className="text-zinc-300 text-xs leading-relaxed truncate">{a.text}</p>
                                        <p className="text-zinc-600 text-[10px] font-mono">{formatTime(a.time)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* quick actions + plan usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* quick actions */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <h3 className="text-white text-sm font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        {[
                            { label: "Create a new poll", to: "/dashboard/create" },
                            { label: "View all polls", to: "/dashboard/polls" },
                            { label: "Analytics overview", to: "/dashboard/analytics" },
                        ].map((action) => (
                            <Link
                                key={action.label}
                                to={action.to}
                                className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-colors group"
                            >
                                <span className="text-zinc-300 text-xs group-hover:text-white transition-colors">{action.label}</span>
                                <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* plan usage */}
                {tier && plan && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white text-sm font-bold">Plan Usage</h3>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{tier.name} plan</span>
                        </div>
                        <div className="space-y-4">
                            {/* auth polls */}
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-zinc-400 text-xs">Authenticated polls</span>
                                    <span className="text-white text-xs font-mono">{plan.authPollsUsed}/{plan.authPollsLimit}</span>
                                </div>
                                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (plan.authPollsUsed / plan.authPollsLimit) * 100)}%` }} />
                                </div>
                            </div>
                            {/* anon polls */}
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-zinc-400 text-xs">Anonymous polls</span>
                                    <span className="text-white text-xs font-mono">{plan.anonPollsUsed}/{plan.anonPollsLimit}</span>
                                </div>
                                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (plan.anonPollsUsed / plan.anonPollsLimit) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                        <Link to="/pricing" className="block mt-4 text-center text-xs text-zinc-500 hover:text-white transition-colors">
                            Upgrade plan →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
