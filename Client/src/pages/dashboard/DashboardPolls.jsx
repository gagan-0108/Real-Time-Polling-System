import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search, PlusCircle, ExternalLink, BarChart3, Trash2, Clock, Users, Lock, Globe, Loader2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";

const STATUS_STYLES = {
    active: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    expired: "bg-zinc-400/10 text-zinc-400 border-zinc-400/20",
    published: "bg-white/10 text-white border-white/20",
    draft: "bg-zinc-700/10 text-zinc-600 border-zinc-700/20",
};

const MODE_ICONS = {
    authenticated: { Icon: Lock, label: "Authenticated" },
    anonymous: { Icon: Globe, label: "Anonymous" },
};

function PollCard({ poll, onDelete }) {
    const statusStyle = STATUS_STYLES[poll.status] || STATUS_STYLES.draft;
    const modeInfo = MODE_ICONS[poll.mode] || MODE_ICONS.authenticated;
    const pct = poll.maxResponses > 0 ? Math.round((poll.responses / poll.maxResponses) * 100) : 0;

    return (
        <div className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{poll.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-widest ${statusStyle}`}>
                            {poll.status}
                        </span>
                        <span className="flex items-center gap-1 text-zinc-500 text-[10px]">
                            <modeInfo.Icon size={10} />
                            {modeInfo.label}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                        to={`/poll/${poll.id}/results`}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                    >
                        <BarChart3 size={14} />
                    </Link>
                    <a
                        href={`/poll/${poll.id}`}
                        target="_blank"
                        rel="noopener"
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                    >
                        <ExternalLink size={14} />
                    </a>
                    <button
                        onClick={() => onDelete(poll.id)}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* meta row */}
            <div className="flex items-center gap-4 text-zinc-500 text-xs mb-3">
                <span className="flex items-center gap-1"><Users size={12} />{poll.responses} responses</span>
                <span>{poll.questions} questions</span>
                {poll.expiresAt && (
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(poll.expiresAt).toLocaleDateString()}
                    </span>
                )}
            </div>

            {/* progress bar */}
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-white/30 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-zinc-600 text-[10px] mt-1 font-mono">{pct}% capacity</p>
        </div>
    );
}

export default function DashboardPolls() {
    const { api, ready } = useApi();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const fetchPolls = async () => {
        if (!api) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.polls.list();
            setPolls(res.polls || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ready) fetchPolls();
    }, [ready]);

    const handleDelete = async (pollId) => {
        if (!confirm("Delete this poll? This cannot be undone.")) return;
        try {
            await api.polls.delete(pollId);
            setPolls((prev) => prev.filter((p) => p.id !== pollId));
        } catch (err) {
            alert(err.message);
        }
    };

    const filtered = polls.filter((p) => {
        if (filter !== "all" && p.status !== filter) return false;
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const statuses = ["all", "active", "draft", "expired", "published"];

    if (!ready || loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">My Polls</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage and track your polls</p>
                </div>
                <Link
                    to="/dashboard/create"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all"
                >
                    <PlusCircle size={16} /> New Poll
                </Link>
            </div>

            {/* filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search polls…"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors"
                    />
                </div>
                <div className="flex items-center gap-1">
                    {statuses.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                filter === s
                                    ? "bg-zinc-800 text-white"
                                    : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                            }`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* error */}
            {error && (
                <div className="text-center py-8">
                    <p className="text-zinc-500 text-sm mb-2">{error}</p>
                    <button onClick={fetchPolls} className="text-xs text-white hover:underline">Retry</button>
                </div>
            )}

            {/* poll list */}
            {!error && filtered.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-zinc-500 text-sm">
                        {polls.length === 0 ? "No polls yet. Create your first one!" : "No polls match your filters"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((poll) => (
                        <PollCard key={poll.id} poll={poll} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}
