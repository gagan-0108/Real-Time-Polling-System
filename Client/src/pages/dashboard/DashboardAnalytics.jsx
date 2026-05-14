import { useState, useEffect } from "react";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Loader2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";

const PIE_COLORS = ["#ffffff", "#52525b"];

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                <p className="text-white text-xs font-bold">{label || payload[0].name}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-zinc-400 text-xs">{p.dataKey || p.name}: {p.value}</p>
                ))}
            </div>
        );
    }
    return null;
}

function SectionCard({ title, subtitle, children }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-4">
                <h3 className="text-white text-sm font-bold">{title}</h3>
                {subtitle && <p className="text-zinc-500 text-xs mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

function QuestionBreakdown({ question }) {
    return (
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-start justify-between mb-3">
                <p className="text-white text-xs font-medium leading-relaxed">{question.text}</p>
                <span className={`ml-2 flex-shrink-0 text-[10px] font-mono uppercase tracking-widest ${
                    question.mandatory ? "text-white" : "text-zinc-600"
                }`}>
                    {question.mandatory ? "Required" : "Optional"}
                </span>
            </div>
            <div className="space-y-2">
                {question.options.map((opt) => (
                    <div key={opt.label}>
                        <div className="flex justify-between mb-1">
                            <span className="text-zinc-400 text-xs">{opt.label}</span>
                            <span className="text-zinc-500 text-xs font-mono">{opt.count} ({opt.pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${opt.pct}%` }} />
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-zinc-600 text-[10px] mt-2 font-mono">{question.totalResponses} total responses</p>
        </div>
    );
}

export default function DashboardAnalytics() {
    const { api, ready } = useApi();
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const [polls, setPolls] = useState([]);
    const [questionData, setQuestionData] = useState(null);
    const [selectedPollId, setSelectedPollId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!api) return;
        setLoading(true);
        setError(null);
        try {
            const [overviewRes, trendsRes, pollsRes] = await Promise.all([
                api.analytics.overview(),
                api.analytics.trends(),
                api.polls.list(),
            ]);
            setOverview(overviewRes);
            setTrends(trendsRes.months || []);
            setPolls(pollsRes.polls || []);

            // Load question analytics for the first poll if available
            const activePoll = (pollsRes.polls || []).find((p) => p.responses > 0);
            if (activePoll) {
                setSelectedPollId(activePoll.id);
                const qRes = await api.analytics.questionAnalytics(activePoll.id);
                setQuestionData(qRes);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadPollQuestions = async (pollId) => {
        if (!api || !pollId) return;
        setSelectedPollId(pollId);
        try {
            const qRes = await api.analytics.questionAnalytics(pollId);
            setQuestionData(qRes);
        } catch (err) {
            console.error("Failed to load question analytics:", err);
        }
    };

    useEffect(() => {
        if (ready) fetchData();
    }, [ready]);

    if (!ready || loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-zinc-500 text-sm mb-3">{error}</p>
                <button onClick={fetchData} className="text-xs text-white hover:underline">Retry</button>
            </div>
        );
    }

    // Build performance data from polls list
    const pollPerformance = polls.slice(0, 5).map((p) => ({
        name: p.title.length > 15 ? p.title.slice(0, 15) + "…" : p.title,
        responses: p.responses,
        completion: p.maxResponses > 0 ? Math.round((p.responses / p.maxResponses) * 100) : 0,
    }));

    const activePolls = polls.filter((p) => p.status === "active").length;

    return (
        <div>
            {/* header */}
            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
                <p className="text-zinc-500 text-sm mt-1">Insights across all your polls</p>
            </div>

            {/* overview stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Responses", value: (overview?.totalResponses || 0).toLocaleString() },
                    { label: "Avg Response Time", value: overview?.avgResponseTime || "0m 0s" },
                    { label: "Completion Rate", value: `${overview?.completionRate || 0}%` },
                    { label: "Active Polls", value: String(activePolls) },
                ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950">
                        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-2">{stat.label}</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* monthly trend */}
                <SectionCard title="Monthly Trend" subtitle="Polls & responses over time">
                    {trends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="responses" stroke="#ffffff" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="polls" stroke="#71717a" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-zinc-600 text-sm">No data yet</div>
                    )}
                </SectionCard>

                {/* poll performance */}
                <SectionCard title="Poll Performance" subtitle="Responses per poll">
                    {pollPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={pollPerformance}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="responses" fill="#ffffff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-zinc-600 text-sm">No polls yet</div>
                    )}
                </SectionCard>

                {/* participation mode */}
                <SectionCard title="Participation Mode" subtitle="Authenticated vs Anonymous">
                    <div className="flex items-center justify-center h-[200px]">
                        {overview?.participationByMode ? (
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={overview.participationByMode}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {overview.participationByMode.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <span className="text-zinc-600 text-sm">No data</span>
                        )}
                    </div>
                    {overview?.participationByMode && (
                        <div className="flex items-center justify-center gap-6 -mt-2">
                            {overview.participationByMode.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                                    <span className="text-zinc-400 text-xs">{item.name} ({item.value})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* per-question analytics */}
            {polls.length > 0 && (
                <SectionCard
                    title="Per-Question Analytics"
                    subtitle={
                        <div className="flex items-center gap-2 mt-1">
                            <select
                                value={selectedPollId || ""}
                                onChange={(e) => loadPollQuestions(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                            >
                                {polls.filter((p) => p.responses > 0).map((p) => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                    }
                >
                    {questionData?.questions?.length > 0 ? (
                        <div className="space-y-4">
                            {questionData.questions.map((q) => (
                                <QuestionBreakdown key={q.id} question={q} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-600 text-xs">No question data available</p>
                    )}
                </SectionCard>
            )}
        </div>
    );
}
