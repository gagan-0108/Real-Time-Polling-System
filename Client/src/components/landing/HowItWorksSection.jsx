import { useEffect, useRef, useState } from "react";
import { HOW_IT_WORKS } from "../../constants/landingData";

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

// Hardcoded expanded content per step shown on hover
const STEP_HOVER_DETAIL = {
    "01": {
        items: [
            "📝  Write your question",
            "☑  Mark as mandatory / optional",
            "🔒  Choose anonymous or authenticated",
            "⏱  Set an expiry date & time",
        ],
    },
    "02": {
        items: [
            "🔗  Get a unique public link",
            "📧  Share via email or Slack",
            "📱  Works on mobile, no app needed",
            "🌐  Accessible without an account",
        ],
    },
    "03": {
        items: [
            "⚡  Live response counter updates",
            "📊  Per-question option breakdowns",
            "📢  One-click publish final results",
            "🔁  Same link shows outcome publicly",
        ],
    },
};

function StepCard({ num, title, desc, vis, delay }) {
    const [hovered, setHovered] = useState(false);
    const detail = STEP_HOVER_DETAIL[num];

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ transitionDelay: `${delay}ms` }}
            className={`relative overflow-hidden bg-black p-8 group cursor-default
                  transition-all duration-500 hover:bg-zinc-950
                  ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
            {/* number */}
            <span
                className={`block text-5xl font-black font-mono mb-4 transition-colors duration-200 ${
                    hovered ? "text-zinc-600" : "text-zinc-800"
                }`}
            >
                {num}
            </span>

            {/* default content */}
            <div
                className={`transition-all duration-300 ${
                    hovered
                        ? "opacity-0 -translate-y-2 pointer-events-none absolute"
                        : "opacity-100 translate-y-0"
                }`}
            >
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
            </div>

            {/* hover detail */}
            <div
                className={`transition-all duration-300 ${
                    hovered
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none absolute"
                }`}
            >
                <h3 className="text-white font-bold text-base mb-3">{title}</h3>
                <div className="flex flex-col gap-2">
                    {detail.items.map((item) => (
                        <p
                            key={item}
                            className="text-zinc-400 text-xs leading-relaxed"
                        >
                            {item}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function HowItWorksSection() {
    const [ref, vis] = useReveal();

    return (
        <section className="px-6 py-24 border-t border-zinc-900">
            {/* heading */}
            <div
                ref={ref}
                className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${
                    vis
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-6"
                }`}
            >
                <p className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest mb-3">
                    How it works
                </p>
                <h2
                    className="text-4xl font-black tracking-tighter text-white"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                    Three steps, that's it.
                </h2>
                <p className="text-zinc-600 text-sm mt-3 font-mono">
                    hover each step for details
                </p>
            </div>

            {/* steps */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 rounded-2xl overflow-hidden">
                {HOW_IT_WORKS.map((step, i) => (
                    <StepCard
                        key={step.num}
                        {...step}
                        vis={vis}
                        delay={i * 100}
                    />
                ))}
            </div>
        </section>
    );
}
