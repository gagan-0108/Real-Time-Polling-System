import { useEffect, useRef, useState } from "react";
import FeatureCard from "../ui/FeatureCard";
import { FEATURES } from "../../constants/landingData";

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
            { threshold: 0.1 },
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return [ref, vis];
}

export default function FeaturesSection() {
    const [headRef, headVis] = useReveal();

    return (
        <section className="px-6 py-28 max-w-7xl mx-auto">
            {/* heading */}
            <div
                ref={headRef}
                className={`mb-14 transition-all duration-700 ${
                    headVis
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-6"
                }`}
            >
                <p className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest mb-3">
                    Features
                </p>
                <h2
                    className="text-4xl md:text-5xl font-black tracking-tighter"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                    <span className="text-white">Everything you need.</span>
                    <br />
                    <span className="text-zinc-600">Nothing you don't.</span>
                </h2>
                <p className="text-zinc-600 text-sm mt-3 font-mono">
                    ← hover each card to see a live preview
                </p>
            </div>

            {/* grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURES.map((feat, i) => (
                    <FeatureCard
                        key={feat.id}
                        icon={feat.icon}
                        title={feat.title}
                        desc={feat.desc}
                        preview={feat.preview}
                        style={{
                            transitionDelay: `${i * 60}ms`,
                            opacity: headVis ? 1 : 0,
                            transform: headVis
                                ? "translateY(0)"
                                : "translateY(24px)",
                            transition: `opacity 0.6s ease ${i * 60}ms, transform 0.6s ease ${i * 60}ms`,
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
