import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useApi } from "../../hooks/useApi";
import { getTier } from "../../constants/pricing";
import { Gauge, ArrowUpRight, Infinity, Crown } from "lucide-react";

function UsageBar({ label, used, limit, color = "bg-white" }) {
    const isUnlimited = limit === -1;
    const pct = isUnlimited ? 5 : limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
    const atLimit = !isUnlimited && limit > 0 && used >= limit;

    return (
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-400 text-xs font-medium">{label}</span>
                <span className={`text-xs font-mono ${atLimit ? "text-red-400" : "text-white"}`}>
                    {used} / {isUnlimited ? "∞" : limit}
                </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                        atLimit ? "bg-red-500" : color
                    }`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {atLimit && (
                <p className="text-red-400/80 text-[10px] mt-2 font-medium">Limit reached — upgrade for more</p>
            )}
        </div>
    );
}

export default function DashboardUsage() {
    const { api, ready } = useApi();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ready || !api) return;
        api.user.plan()
            .then(setPlan)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [ready]);

    const tier = plan ? getTier(plan.plan) : getTier("free");

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Usage & Plan</h1>
                    <p className="text-zinc-500 text-sm mt-1">Monitor your resource usage and plan limits.</p>
                </div>
                <Link
                    to="/pricing"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-zinc-700 rounded-xl text-zinc-300 hover:border-zinc-500 hover:text-white transition-all"
                >
                    <ArrowUpRight size={12} />
                    View Plans
                </Link>
            </div>

            {/* current plan card */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            plan?.unlimited
                                ? "bg-amber-500/10 border border-amber-500/30"
                                : tier?.id === "pro"
                                    ? "bg-violet-500/10 border border-violet-500/30"
                                    : tier?.id === "go"
                                        ? "bg-blue-500/10 border border-blue-500/30"
                                        : "bg-zinc-800 border border-zinc-700"
                        }`}>
                            {plan?.unlimited ? (
                                <Infinity size={18} className="text-amber-400" />
                            ) : (
                                <Crown size={18} className={
                                    tier?.id === "pro" ? "text-violet-400"
                                        : tier?.id === "go" ? "text-blue-400"
                                            : "text-zinc-400"
                                } />
                            )}
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">
                                {plan?.unlimited ? "Unlimited" : tier?.name || "Free"} Plan
                            </h2>
                            <p className="text-zinc-500 text-xs">
                                {plan?.unlimited
                                    ? "You have unlimited access to all features."
                                    : tier?.description || "Get started with real-time polling."}
                            </p>
                        </div>
                    </div>
                    {!plan?.unlimited && tier?.id === "free" && (
                        <Link
                            to="/pricing"
                            className="px-5 py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all"
                        >
                            Upgrade
                        </Link>
                    )}
                </div>
            </div>

            {/* usage bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <UsageBar
                    label="Authenticated Polls"
                    used={plan?.authPollsUsed || 0}
                    limit={plan?.authPollsLimit ?? 5}
                    color="bg-white"
                />
                <UsageBar
                    label="Anonymous Polls"
                    used={plan?.anonPollsUsed || 0}
                    limit={plan?.anonPollsLimit ?? 2}
                    color="bg-blue-400"
                />
                <UsageBar
                    label="Responses Stored"
                    used={plan?.responsesStored || 0}
                    limit={plan?.responsesLimit ?? 100}
                    color="bg-emerald-400"
                />
            </div>

            {/* billing period */}
            {plan?.billingPeriodEnd && (
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950">
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-xs">Billing period resets</span>
                        <span className="text-white text-xs font-mono">
                            {new Date(plan.billingPeriodEnd).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                    </div>
                </div>
            )}

            {/* plan features */}
            {tier && (
                <div className="mt-8">
                    <h3 className="text-white font-bold text-sm mb-4">What's included in {tier.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tier.features
                            .filter((f) => f.included)
                            .map((f) => (
                                <div
                                    key={f.label}
                                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-zinc-800/50 bg-zinc-950/50"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                    <span className="text-zinc-400 text-xs">{f.label}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
