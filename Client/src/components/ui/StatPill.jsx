export default function StatPill({ value, label }) {
    return (
        <div className="flex flex-col items-start gap-1">
            <span className="text-white text-3xl font-black tracking-tighter">
                {value}
            </span>
            <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
                {label}
            </span>
        </div>
    );
}
