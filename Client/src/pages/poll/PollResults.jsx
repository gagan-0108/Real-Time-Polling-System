import { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import NavigationBar from "../../components/NavigationBar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy, Users, Loader2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";

function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                <p className="text-white text-xs font-bold">{payload[0].payload.label}</p>
                <p className="text-zinc-400 text-xs">{payload[0].value} votes ({payload[0].payload.pct}%)</p>
            </div>
        );
    }
    return null;
}

export default function PollResults() {
    const { pollId } = useParams({ strict: false });
    const { api, ready } = useApi();
    const [poll, setPoll] = useState(null);
    const [questionData, setQuestionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!api || !pollId) return;
            setLoading(true);
            try {
                const [pollRes, qRes] = await Promise.all([
                    api.polls.get(pollId),
                    api.analytics.questionAnalytics(pollId),
                ]);
                setPoll(pollRes);
                setQuestionData(qRes);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (ready) fetchData();
    }, [ready, pollId]);

    if (!ready || loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <NavigationBar />
                <div className="flex items-center justify-center pt-32">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !questionData) {
        return (
            <div className="min-h-screen bg-black text-white">
                <NavigationBar />
                <div className="text-center pt-32">
                    <p className="text-zinc-500 text-sm">{error || "No results available"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <NavigationBar />

            <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
                {/* header */}
                <div className="text-center mb-10">
                    <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mb-3">
                        {poll?.status === "published" ? "Published Results" : "Poll Results"}
                    </p>
                    <h1
                        className="text-4xl font-black tracking-tighter mb-2"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        {poll?.title || "Poll Results"}
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        {poll?.status === "published"
                            ? "Final results are in. Here's what the community decided."
                            : "Live results from this poll."}
                    </p>
                </div>

                {/* per-question results */}
                <div className="space-y-6">
                    {questionData.questions.map((q, qIdx) => {
                        const winner = q.options.length > 0
                            ? q.options.reduce((a, b) => (b.count > a.count ? b : a))
                            : null;

                        return (
                            <div key={q.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="text-zinc-500 text-[10px] font-mono mb-1 block">Q{qIdx + 1}</span>
                                        <h3 className="text-white text-sm font-bold">{q.text}</h3>
                                    </div>
                                    <span className="flex items-center gap-1 text-zinc-500 text-xs">
                                        <Users size={12} /> {q.totalResponses}
                                    </span>
                                </div>

                                {/* winner highlight */}
                                {winner && winner.count > 0 && (
                                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                                        <Trophy size={16} className="text-white" />
                                        <div>
                                            <p className="text-white text-xs font-bold">{winner.label}</p>
                                            <p className="text-zinc-500 text-[10px]">{winner.count} votes · {winner.pct}%</p>
                                        </div>
                                    </div>
                                )}

                                {/* bar chart */}
                                {q.options.length > 0 && (
                                    <ResponsiveContainer width="100%" height={Math.max(100, q.options.length * 35)}>
                                        <BarChart data={q.options} layout="vertical">
                                            <XAxis type="number" hide />
                                            <YAxis
                                                type="category"
                                                dataKey="label"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                                width={100}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="count" fill="#ffffff" radius={[0, 4, 4, 0]} barSize={16} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}

                                {/* text breakdown */}
                                <div className="mt-4 space-y-2">
                                    {q.options.map((opt) => (
                                        <div key={opt.label}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-zinc-400 text-xs">{opt.label}</span>
                                                <span className="text-zinc-500 text-xs font-mono">{opt.count} ({opt.pct}%)</span>
                                            </div>
                                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-white/40 rounded-full" style={{ width: `${opt.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
