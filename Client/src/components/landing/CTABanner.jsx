import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

function useReveal() {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setVis(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return [ref, vis];
}

export function CTABanner({ onCreatePoll }) {
    const [ref, vis] = useReveal();
    const [hovered, setHovered] = useState(false);

    return (
        <section className="px-6 py-24 max-w-7xl mx-auto">
            <div
                ref={ref}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={`relative rounded-3xl border overflow-hidden p-12 md:p-20 text-center
                    bg-zinc-950 transition-all duration-700 cursor-default
                    ${hovered ? "border-zinc-600" : "border-zinc-800"}
                    ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
                {/* glow */}
                <div
                    className={`absolute inset-0 flex items-center justify-center pointer-events-none
                      transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`}
                >
                    <div className="w-96 h-96 bg-white opacity-[0.03] rounded-full blur-3xl" />
                </div>

                {/* fixed-height wrapper to prevent layout shift */}
                <div className="relative z-10" style={{ minHeight: "280px" }}>
                    {/* default state */}
                    <div
                        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
                            hovered
                                ? "opacity-0 scale-95 pointer-events-none"
                                : "opacity-100 scale-100"
                        }`}
                    >
                        <h2
                            className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6"
                            style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                            Ready to start?
                        </h2>
                        <p className="text-zinc-500 text-lg mb-10">
                            Try for free. Create. Share. Always real-time.
                        </p>
                        <button
                            onClick={onCreatePoll}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white
                           text-black font-bold text-sm rounded-xl hover:bg-zinc-200
                           transition-all duration-150 hover:scale-[1.02] active:scale-95"
                        >
                            Create your first poll →
                        </button>
                    </div>

                    {/* hovered state — mini analytics teaser */}
                    <div
                        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
                            hovered
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-105 pointer-events-none"
                        }`}
                    >
                        <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mb-6">
                            What you'll see after submitting
                        </p>
                        <div className="max-w-xs w-full text-left space-y-3 mb-8">
                            {[
                                { label: "Total responses", val: "248" },
                                { label: "Completion rate", val: "91%" },
                                { label: "Avg. time", val: "1m 24s" },
                                { label: "Anonymous", val: "63 / 248" },
                            ].map(({ label, val }) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-zinc-500 text-xs">
                                        {label}
                                    </span>
                                    <span className="text-white text-xs font-mono font-bold">
                                        {val}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={onCreatePoll}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black
                           font-bold text-sm rounded-xl hover:bg-zinc-200 transition-all duration-150"
                        >
                            Create your first poll →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function FooterSection() {
    return (
        <footer className="border-t border-zinc-900 px-6 py-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <span className="text-zinc-700 text-xs font-mono">
                    © 2025 IonPoll · Built with Socket.io + Vite + Express
                </span>
                <div className="flex gap-6">
                    {["Privacy", "Terms", "Contact", "GitHub"].map((l) => (
                        <a
                            key={l}
                            href="#"
                            className="text-zinc-700 hover:text-zinc-400 text-xs transition-colors"
                        >
                            {l}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
