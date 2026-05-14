import NavigationBar from "../components/NavigationBar";
import { FooterSection } from "../components/landing/CTABanner";
import { ABOUT_HERO, ABOUT_MISSION, ABOUT_VALUES, ABOUT_ROADMAP, ABOUT_TEAM } from "../constants/siteContent";
import { Link } from "@tanstack/react-router";

export default function AboutPage() {
    return (
        <div className="min-h-screen w-full bg-black text-white">
            <NavigationBar />

            {/* ── hero ── */}
            <section className="px-6 pt-28 pb-16 max-w-4xl mx-auto text-center">
                <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mb-3">About</p>
                <h1
                    className="text-5xl md:text-6xl font-black tracking-tighter mb-6"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                    {ABOUT_HERO.headline}
                </h1>
                <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    {ABOUT_HERO.subline}
                </p>
            </section>

            {/* ── mission ── */}
            <section className="px-6 py-16 max-w-4xl mx-auto">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 md:p-12">
                    <h2 className="text-2xl font-black tracking-tight mb-4">{ABOUT_MISSION.title}</h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">{ABOUT_MISSION.body}</p>
                </div>
            </section>

            {/* ── values ── */}
            <section className="px-6 py-16 max-w-6xl mx-auto">
                <h2
                    className="text-3xl font-black tracking-tighter text-center mb-12"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                    What drives us.
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ABOUT_VALUES.map((v) => (
                        <div key={v.title} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 hover:border-zinc-600 transition-colors duration-200">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mb-4 text-xl">
                                {v.icon}
                            </div>
                            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-2">{v.title}</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── roadmap ── */}
            <section className="px-6 py-16 max-w-3xl mx-auto border-t border-zinc-900">
                <h2
                    className="text-3xl font-black tracking-tighter text-center mb-12"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                    Roadmap
                </h2>
                <div className="space-y-4">
                    {ABOUT_ROADMAP.map((item) => (
                        <div
                            key={item.quarter}
                            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950"
                        >
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                item.status === "done" ? "bg-emerald-400" :
                                item.status === "current" ? "bg-white animate-pulse" :
                                "bg-zinc-700"
                            }`} />
                            <span className="text-zinc-500 text-xs font-mono w-20 flex-shrink-0">{item.quarter}</span>
                            <span className={`text-sm font-medium ${
                                item.status === "done" ? "text-zinc-400" :
                                item.status === "current" ? "text-white" :
                                "text-zinc-600"
                            }`}>
                                {item.label}
                            </span>
                            {item.status === "current" && (
                                <span className="ml-auto text-[10px] font-mono text-emerald-400 uppercase tracking-widest">In progress</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── team ── */}
            <section className="px-6 py-16 max-w-4xl mx-auto border-t border-zinc-900">
                <h2
                    className="text-3xl font-black tracking-tighter text-center mb-12"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                    The team behind IonPoll.
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ABOUT_TEAM.map((member) => (
                        <div key={member.name} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 text-center">
                            <div className="w-16 h-16 rounded-full bg-zinc-800 mx-auto mb-4 flex items-center justify-center text-2xl text-zinc-500">
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    member.name[0]
                                )}
                            </div>
                            <h3 className="text-white font-semibold text-sm mb-1">{member.name}</h3>
                            <p className="text-zinc-500 text-xs">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="px-6 py-20 max-w-4xl mx-auto text-center border-t border-zinc-900">
                <h2 className="text-3xl font-black tracking-tighter mb-4">Ready to create your first poll?</h2>
                <p className="text-zinc-500 text-sm mb-8">Free to start. No credit card required.</p>
                <Link
                    to="/auth"
                    search={{ mode: "signup" }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-200 transition-all duration-150"
                >
                    Get started →
                </Link>
            </section>

            <FooterSection />
        </div>
    );
}
