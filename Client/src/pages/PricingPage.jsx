import { useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { FooterSection } from "../components/landing/CTABanner";
import { PRICING_TIERS, COMPARISON_ROWS } from "../constants/pricing";
import { Link, useSearch } from "@tanstack/react-router";
import { Check, X, AlertTriangle } from "lucide-react";

function PricingCard({ tier, yearly }) {
    const price = yearly ? tier.yearlyPrice : tier.price;
    const isPopular = tier.badge === "Popular";

    return (
        <div
            className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:border-zinc-600 ${
                isPopular
                    ? "border-white/20 bg-zinc-900/50 scale-[1.02]"
                    : "border-zinc-800 bg-zinc-950"
            }`}
        >
            {tier.badge && (
                <span className="absolute -top-3 left-6 px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {tier.badge}
                </span>
            )}

            <h3 className="text-white text-lg font-bold mb-1">{tier.name}</h3>
            <p className="text-zinc-500 text-xs mb-6 leading-relaxed">{tier.description}</p>

            <div className="mb-6">
                <span className="text-4xl font-black text-white tracking-tighter">
                    ${price}
                </span>
                {price > 0 && (
                    <span className="text-zinc-500 text-sm ml-1">/ {tier.period}</span>
                )}
                {yearly && price > 0 && (
                    <p className="text-emerald-400 text-[10px] font-mono mt-1">
                        Save ${(tier.price - tier.yearlyPrice) * 12}/yr
                    </p>
                )}
            </div>

            <Link
                to="/auth"
                search={{ mode: "signup" }}
                className={`w-full py-3 text-sm font-bold rounded-xl text-center transition-all duration-150 mb-6 block ${
                    tier.ctaVariant === "solid"
                        ? "bg-white text-black hover:bg-zinc-200"
                        : tier.ctaVariant === "accent"
                          ? "bg-zinc-100 text-black hover:bg-white"
                          : "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                }`}
            >
                {tier.cta}
            </Link>

            <div className="flex flex-col gap-2.5 flex-1">
                {tier.features.map((f) => (
                    <div key={f.label} className="flex items-start gap-2.5">
                        {f.included ? (
                            <Check size={14} className="text-white mt-0.5 flex-shrink-0" />
                        ) : (
                            <X size={14} className="text-zinc-700 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-xs leading-relaxed ${f.included ? "text-zinc-300" : "text-zinc-700"}`}>
                            {f.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatValue(val) {
    if (val === true) return <Check size={14} className="text-white" />;
    if (val === false) return <X size={14} className="text-zinc-700" />;
    if (val === -1) return "Unlimited";
    return String(val);
}

export default function PricingPage() {
    const [yearly, setYearly] = useState(false);
    const { upgrade } = useSearch({ strict: false });

    return (
        <div className="min-h-screen w-full bg-black text-white">
            <NavigationBar />

            <section className="px-6 pt-28 pb-20 max-w-6xl mx-auto">
                {/* upgrade banner */}
                {upgrade === "true" && (
                    <div className="mb-8 flex items-center gap-3 px-5 py-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                        <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                        <p className="text-amber-300 text-sm font-medium">
                            You've reached your current plan limit. Upgrade to continue creating polls.
                        </p>
                    </div>
                )}

                {/* heading */}
                <div className="text-center mb-14">
                    <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mb-3">Pricing</p>
                    <h1
                        className="text-5xl md:text-6xl font-black tracking-tighter mb-4"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Simple, transparent pricing.
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        Start free. Upgrade when you need more polls, deeper analytics, or longer retention.
                    </p>

                    {/* toggle */}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <span className={`text-sm font-medium ${!yearly ? "text-white" : "text-zinc-500"}`}>Monthly</span>
                        <button
                            onClick={() => setYearly((v) => !v)}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                                yearly ? "bg-white" : "bg-zinc-700"
                            }`}
                        >
                            <span
                                className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${
                                    yearly ? "left-7 bg-black" : "left-1 bg-white"
                                }`}
                            />
                        </button>
                        <span className={`text-sm font-medium ${yearly ? "text-white" : "text-zinc-500"}`}>
                            Yearly
                            <span className="ml-1 text-emerald-400 text-[10px] font-mono">Save 20%</span>
                        </span>
                    </div>
                </div>

                {/* cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {PRICING_TIERS.map((tier) => (
                        <PricingCard key={tier.id} tier={tier} yearly={yearly} />
                    ))}
                </div>

                {/* comparison table */}
                <div className="mb-16">
                    <h2 className="text-2xl font-black tracking-tight text-center mb-8">Compare Plans</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left py-3 px-4 text-zinc-500 font-mono text-xs uppercase tracking-widest">Feature</th>
                                    {PRICING_TIERS.map((t) => (
                                        <th key={t.id} className="text-center py-3 px-4 text-white font-bold">{t.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON_ROWS.map((row) => (
                                    <tr key={row.key} className="border-b border-zinc-900">
                                        <td className="py-3 px-4 text-zinc-400 text-xs">{row.label}</td>
                                        {PRICING_TIERS.map((t) => (
                                            <td key={t.id} className="py-3 px-4 text-center text-zinc-300 text-xs font-mono">
                                                <span className="inline-flex items-center justify-center">
                                                    {formatValue(t.limits[row.key])}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <FooterSection />
        </div>
    );
}
