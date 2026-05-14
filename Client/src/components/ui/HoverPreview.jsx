import { useEffect, useState } from "react";
import {
    PREVIEW_POLL,
    PREVIEW_ANALYTICS,
    PREVIEW_PUBLISH,
} from "../../constants/landingData";

// ─── tiny sub-components ────────────────────────────────

function PreviewLabel({ children }) {
    return (
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">
            {children}
        </p>
    );
}

function Bar({ label, pct, count, delay = 0 }) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setWidth(pct), delay);
        return () => clearTimeout(t);
    }, [pct, delay]);

    return (
        <div className="mb-2 last:mb-0">
            <div className="flex justify-between mb-1">
                <span className="text-zinc-300 text-xs">{label}</span>
                <span className="text-zinc-500 text-xs font-mono">
                    {count ?? `${pct}%`}
                </span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}

// ─── POLL preview ────────────────────────────────────────
function PollPreview() {
    const [sel, setSel] = useState(PREVIEW_POLL.selected);
    return (
        <div>
            <PreviewLabel>Live Poll Preview</PreviewLabel>
            <p className="text-white text-xs font-medium mb-3 leading-snug">
                {PREVIEW_POLL.question}
            </p>
            <div className="flex flex-col gap-1.5">
                {PREVIEW_POLL.options.map((opt, i) => (
                    <button
                        key={opt}
                        onClick={() => setSel(i)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all duration-150 w-full text-left ${
                            sel === i
                                ? "border-white/30 bg-white/10 text-white"
                                : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                        }`}
                    >
                        <span
                            className={`w-3 h-3 rounded-full border flex-shrink-0 transition-colors ${
                                sel === i
                                    ? "border-white bg-white"
                                    : "border-zinc-600"
                            }`}
                        />
                        {opt}
                    </button>
                ))}
            </div>
            <button className="mt-3 w-full py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors">
                Submit →
            </button>
        </div>
    );
}

// ─── LIVE counter preview ────────────────────────────────
function LivePreview() {
    const [count, setCount] = useState(127);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((n) => n + 1);
            setPulse(true);
            setTimeout(() => setPulse(false), 400);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <PreviewLabel>Real-time Feed</PreviewLabel>
            <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-mono">LIVE</span>
            </div>
            <div
                className={`text-5xl font-black text-white font-mono tracking-tighter transition-transform duration-150 ${
                    pulse ? "scale-110" : "scale-100"
                }`}
            >
                {count}
            </div>
            <p className="text-zinc-500 text-xs mt-1">responses collected</p>
            <div className="mt-4 flex flex-col gap-1">
                {[
                    "Q1 — 127 answers",
                    "Q2 — 119 answers",
                    "Q3 — 98 answers",
                ].map((r) => (
                    <div
                        key={r}
                        className="flex items-center gap-2 text-zinc-600 text-xs"
                    >
                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                        {r}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── ANONYMOUS mode preview ──────────────────────────────
function AnonymousPreview() {
    const [anon, setAnon] = useState(true);
    return (
        <div>
            <PreviewLabel>Response Mode</PreviewLabel>
            <div className="flex items-center justify-between mb-4 p-3 rounded-xl border border-zinc-800 bg-zinc-900">
                <span
                    className={`text-xs font-medium ${anon ? "text-white" : "text-zinc-500"}`}
                >
                    Anonymous
                </span>
                <button
                    onClick={() => setAnon((v) => !v)}
                    className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
                        anon ? "bg-zinc-600" : "bg-white"
                    }`}
                >
                    <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                            anon ? "left-0.5 bg-zinc-300" : "left-5 bg-black"
                        }`}
                    />
                </button>
                <span
                    className={`text-xs font-medium ${!anon ? "text-white" : "text-zinc-500"}`}
                >
                    Authenticated
                </span>
            </div>

            {anon ? (
                <div className="flex flex-col gap-2">
                    {["Anon #A3F2", "Anon #B9C1", "Anon #D007"].map((a) => (
                        <div key={a} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                                👤
                            </div>
                            <span className="text-zinc-500 text-xs font-mono">
                                {a}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {["alice@mail.com", "bob@corp.io", "carol@labs.dev"].map(
                        (e) => (
                            <div key={e} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white font-bold">
                                    {e[0].toUpperCase()}
                                </div>
                                <span className="text-zinc-400 text-xs">
                                    {e}
                                </span>
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}

// ─── EXPIRY preview ──────────────────────────────────────
function ExpiryPreview() {
    const [secs, setSecs] = useState(9 * 3600 + 47 * 60 + 33);

    useEffect(() => {
        const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(t);
    }, []);

    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");

    const pct = Math.round((secs / (24 * 3600)) * 100);

    return (
        <div>
            <PreviewLabel>Poll Expiry</PreviewLabel>
            <p className="text-zinc-500 text-xs mb-3">Closes in</p>
            <div className="font-mono text-3xl font-black text-white tracking-tighter mb-4">
                {h}:{m}:{s}
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-zinc-600 text-xs">
                {pct}% of 24hr window remaining
            </p>
            <div className="mt-4 p-2.5 rounded-lg border border-zinc-800 bg-zinc-900">
                <p className="text-zinc-500 text-xs">
                    ⚠ After expiry, the poll link shows a closed notice. No
                    further submissions are accepted.
                </p>
            </div>
        </div>
    );
}

// ─── ANALYTICS preview ───────────────────────────────────
function AnalyticsPreview() {
    const { question, bars, total } = PREVIEW_ANALYTICS;
    return (
        <div>
            <PreviewLabel>Analytics Dashboard</PreviewLabel>
            <p className="text-white text-xs font-medium mb-3 leading-snug">
                {question}
            </p>
            {bars.map((b, i) => (
                <Bar
                    key={b.label}
                    label={b.label}
                    pct={b.pct}
                    count={b.count}
                    delay={i * 120}
                />
            ))}
            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-500 text-xs">
                    {total} total responses
                </span>
                <span className="text-emerald-400 text-xs font-mono">
                    ● live
                </span>
            </div>
        </div>
    );
}

// ─── PUBLISH preview ─────────────────────────────────────
function PublishPreview() {
    const { title, winner, pct, total, bars } = PREVIEW_PUBLISH;
    return (
        <div>
            <PreviewLabel>Published Results</PreviewLabel>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🎉</span>
                <div>
                    <p className="text-white text-xs font-semibold">
                        {winner} wins
                    </p>
                    <p className="text-zinc-500 text-[10px]">
                        {pct} of {total}
                    </p>
                </div>
            </div>
            {bars.map((b, i) => (
                <Bar
                    key={b.label}
                    label={b.label}
                    pct={b.pct}
                    delay={i * 100}
                />
            ))}
            <div className="mt-3 p-2.5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-zinc-300 text-[10px] font-mono">{title}</p>
                <p className="text-zinc-600 text-[10px] mt-0.5">
                    Publicly visible · Results finalized
                </p>
            </div>
        </div>
    );
}

// ─── MAP  ────────────────────────────────────────────────
const PREVIEW_MAP = {
    poll: <PollPreview />,
    live: <LivePreview />,
    anonymous: <AnonymousPreview />,
    expiry: <ExpiryPreview />,
    analytics: <AnalyticsPreview />,
    publish: <PublishPreview />,
};

// ─── EXPORT ──────────────────────────────────────────────
export default function HoverPreview({ type }) {
    return PREVIEW_MAP[type] ?? null;
}
