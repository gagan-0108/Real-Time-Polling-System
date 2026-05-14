import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import StatPill from "../ui/StatPill";
import useReveal from "./hooks/UseReveal.jsx";

import { STATS } from "../../constants/landingData";
import { HERO_CARDS } from "./constants.js";

// // ── tiny scroll-reveal hook ──────────────────────────────
// function useReveal(threshold = 0.1) {
//     const ref = useRef(null);
//     const [vis, setVis] = useState(false);

//     useEffect(() => {
//         const obs = new IntersectionObserver(
//             ([e]) => {
//                 if (e.isIntersecting) {
//                     setVis(true);
//                     obs.disconnect();
//                 }
//             },
//             { threshold },
//         );
//         if (ref.current) obs.observe(ref.current);
//         return () => obs.disconnect();
//     }, [threshold]);

//     return [ref, vis];
// }

// ── mini poll card that appears in the hero hover strip ──
function MiniPollCard({ question, options, selected, label }) {
    const [sel, setSel] = useState(selected);
    return (
        <div
            className="flex-shrink-0 w-56 p-4 rounded-xl border border-zinc-800 bg-zinc-950
                 hover:border-zinc-600 transition-colors duration-200"
        >
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-2">
                {label}
            </p>
            <p className="text-white text-xs font-medium mb-3 leading-snug">
                {question}
            </p>
            <div className="flex flex-col gap-1.5">
                {options.map((opt, i) => (
                    <button
                        key={opt}
                        onClick={() => setSel(i)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs
                        transition-all duration-150 text-left w-full ${
                            sel === i
                                ? "border-white/20 bg-white/8 text-white"
                                : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        <span
                            className={`w-2.5 h-2.5 rounded-full border flex-shrink-0 ${
                                sel === i
                                    ? "border-white bg-white"
                                    : "border-zinc-700"
                            }`}
                        />
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

// const HERO_CARDS = [
//     {
//         label: "Sample Poll",
//         question: "What's your fav JS framework?",
//         options: ["React", "Vue", "Svelte", "Angular"],
//         selected: 0,
//     },
//     {
//         label: "Team Pulse",
//         question: "How was today's sprint?",
//         options: ["Great 🚀", "Okay 👍", "Rough 😅"],
//         selected: 1,
//     },
//     {
//         label: "Event Feedback",
//         question: "Rate the workshop quality",
//         options: ["Excellent", "Good", "Average", "Poor"],
//         selected: 0,
//     },
//     {
//         label: "Product Survey",
//         question: "Would you recommend us?",
//         options: ["Definitely", "Maybe", "Not yet"],
//         selected: 0,
//     },
// ];

export default function HeroSection({ onCreatePoll }) {
    const [heroRef, heroVis] = useReveal(0.05);

    const reveal = (delay) =>
        `transition-all duration-700 ${heroVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}` +
        ` [transition-delay:${delay}ms]`;

    return (
        <section className="relative min-h-screen flex flex-col justify-center px-6 pt-16 overflow-hidden">
            {/* grid bg */}
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)," +
                        "linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* noise */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: "128px",
                }}
            />

            {/* content */}
            <div
                ref={heroRef}
                className="relative z-10 max-w-4xl mx-auto w-full"
            >
                {/* badge */}
                <div
                    className={`inline-flex items-center gap-2 border border-zinc-800 rounded-full px-3 py-1 mb-8 ${reveal(0)}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-zinc-500 text-[11px] font-mono tracking-widest uppercase">
                        Socket.io · Live polling
                    </span>
                </div>

                {/* headline */}
                <h1
                    className={`text-6xl md:text-8xl font-black leading-none tracking-tighter mb-6 ${reveal(100)}`}
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                    <span className="text-white">Start creating</span>
                    <br />
                    <span className="text-zinc-600">polls now.</span>
                </h1>

                {/* sub */}
                <p
                    className={`text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10 ${reveal(200)}`}
                >
                    Ask questions, collect responses and watch analytics update
                    live. Anonymous-ready, expiry-controlled, built for real
                    feedback.
                </p>

                {/* CTAs */}
                <div
                    className={`flex flex-wrap gap-4 items-center ${reveal(300)}`}
                >
                    <button
                        onClick={onCreatePoll}
                        className="group relative px-7 py-3.5 bg-white text-black text-sm font-bold
                       rounded-xl overflow-hidden transition-all duration-150
                       hover:scale-[1.02] active:scale-95"
                    >
                        Create a poll →
                    </button>
                    <Link
                        to="/about"
                        className="px-7 py-3.5 border border-zinc-800 text-zinc-400 text-sm font-medium
                       rounded-xl hover:border-zinc-600 hover:text-white transition-all duration-200"
                    >
                        Learn more
                    </Link>
                </div>

                {/* stats */}
                <div className={`mt-20 flex gap-12 ${reveal(450)}`}>
                    {STATS.map((s) => (
                        <StatPill key={s.label} {...s} />
                    ))}
                </div>
            </div>

            {/* ── hover preview strip ── */}
            <div
                className={`relative z-10 max-w-4xl mx-auto w-full mt-16 ${reveal(550)}`}
            >
                <p className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest mb-4">
                    ↓ try hovering the cards below
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {HERO_CARDS.map((c) => (
                        <MiniPollCard key={c.label} {...c} />
                    ))}
                </div>
            </div>

            {/* scroll cue */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-20 animate-bounce">
                <div className="w-px h-6 bg-zinc-400" />
                <div className="w-px h-2 bg-zinc-400" />
            </div>
        </section>
    );
}
