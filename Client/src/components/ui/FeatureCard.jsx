import HoverPreview from "./HoverPreview";

/**
 * FeatureCard
 * Shows icon + title + desc on idle.
 * On hover: preview panel slides up from the bottom.
 */
export default function FeatureCard({ icon, title, desc, preview, style }) {
    return (
        <div
            style={style}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950
                 hover:border-zinc-600 transition-all duration-300 cursor-default min-h-[200px]"
        >
            {/* ── default face ── */}
            <div className="p-6 transition-all duration-300 group-hover:opacity-0 group-hover:pointer-events-none">
                <div
                    className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mb-4
                     group-hover:bg-zinc-800 transition-colors text-xl"
                >
                    {icon}
                </div>
                <h3 className="text-white font-semibold text-sm tracking-wide uppercase mb-2">
                    {title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
            </div>

            {/* ── hover preview — slides up ── */}
            <div
                className="absolute inset-0 p-5 bg-zinc-950/98 border-t border-zinc-800
                   translate-y-full group-hover:translate-y-0
                   transition-transform duration-300 ease-out overflow-auto"
            >
                <HoverPreview type={preview} />
            </div>
        </div>
    );
}
