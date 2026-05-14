import { useEffect, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { SignIn, SignUp } from "@clerk/react";
import { Zap, Shield, BarChart3, Clock, Megaphone } from "lucide-react";

// ── Clerk dark appearance ─────────────────────────────────
const CLERK_APPEARANCE = {
    variables: {
        colorBackground: "#09090b",
        colorInputBackground: "#18181b",
        colorInputText: "#ffffff",
        colorText: "#ffffff",
        colorTextSecondary: "#71717a",
        colorPrimary: "#ffffff",
        colorDanger: "#f87171",
        borderRadius: "0.75rem",
        fontFamily: "inherit",
    },
    elements: {
        card: "shadow-none bg-transparent",
        headerTitle: "text-white font-black tracking-tight text-xl",
        headerSubtitle: "text-zinc-500 text-sm",
        formButtonPrimary:
            "bg-white text-black font-bold hover:bg-zinc-200 transition-all rounded-xl",
        footerActionLink: "text-zinc-300 hover:text-white",
        formFieldInput:
            "bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-zinc-500 rounded-xl",
        formFieldLabel:
            "text-zinc-400 text-xs uppercase tracking-widest font-mono",
        dividerLine: "bg-zinc-800",
        dividerText: "text-zinc-600 text-xs",
        socialButtonsIconButton:
            "border-zinc-700 bg-zinc-900 hover:bg-zinc-800 rounded-xl",
        alertText: "text-red-400 text-xs",
        footer: "hidden",
    },
};

// ── feature pills ─────────────────────────────────────────
const FEATURES = [
    { icon: Zap, label: "Live response counts", color: "text-amber-400" },
    { icon: Shield, label: "Anonymous & auth modes", color: "text-emerald-400" },
    { icon: BarChart3, label: "Analytics dashboard", color: "text-blue-400" },
    { icon: Clock, label: "Expiry control", color: "text-violet-400" },
    { icon: Megaphone, label: "One-click publish", color: "text-pink-400" },
];

// ── mode tab ──────────────────────────────────────────────
function ModeTab({ label, value, current }) {
    return (
        <Link
            to="/auth"
            search={{ mode: value }}
            className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                current === value
                    ? "bg-white text-black shadow-lg shadow-white/5"
                    : "text-zinc-500 hover:text-white"
            }`}
        >
            {label}
        </Link>
    );
}

export default function AuthPage() {
    const { mode = "signin" } = useSearch({ strict: false });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);

    const isSignIn = mode === "signin";

    return (
        <div className="min-h-screen w-full bg-black flex overflow-hidden">
            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden">
                {/* gradient mesh background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[100px]" />
                    <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-emerald-600/5 blur-[80px]" />
                </div>

                {/* subtle grid */}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)," +
                            "linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                    }}
                />

                {/* logo */}
                <Link
                    to="/"
                    className="relative z-10 flex items-center gap-2.5 group w-fit"
                >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-95">
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                            <path d="M3 14L9 4L15 14" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5.5 10.5H12.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="text-white font-semibold text-lg font-mono">IonPoll</span>
                </Link>

                {/* tagline + features */}
                <div className="relative z-10">
                    <h2
                        className="text-5xl font-black tracking-tighter leading-[1.1] text-white mb-3"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Polls that
                        <br />
                        <span className="bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                            think live.
                        </span>
                    </h2>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mb-10">
                        Create, share and analyze polls with real-time updates.
                        Your audience responds — you see it instantly.
                    </p>

                    {/* animated feature pills */}
                    <div className="flex flex-col gap-2.5">
                        {FEATURES.map((f, i) => (
                            <div
                                key={f.label}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-sm w-fit transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/40"
                                style={{
                                    animationDelay: `${i * 150}ms`,
                                }}
                            >
                                <f.icon size={14} className={f.color} />
                                <span className="text-zinc-400 text-xs font-medium">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-zinc-800 text-xs font-mono">
                    © 2025 IonPoll
                </p>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative bg-zinc-950/30">
                {/* border accent */}
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />

                {/* mobile logo */}
                <Link to="/" className="lg:hidden flex items-center gap-2 mb-10">
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                            <path d="M3 14L9 4L15 14" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5.5 10.5H12.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="text-white font-semibold font-mono">IonPoll</span>
                </Link>

                {/* mode toggle */}
                <div
                    className={`relative z-10 mb-8 flex items-center bg-zinc-900/50 border border-zinc-800 rounded-2xl p-1 transition-all duration-500 ${
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                >
                    <ModeTab label="Sign In" value="signin" current={mode} />
                    <ModeTab label="Sign Up" value="signup" current={mode} />
                </div>

                {/* Clerk form — glassmorphism card */}
                <div
                    className={`relative z-10 w-full max-w-sm transition-all duration-500 delay-100 ${
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
                >
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl p-6 shadow-2xl shadow-black/40">
                        {isSignIn ? (
                            <SignIn
                                appearance={CLERK_APPEARANCE}
                                fallbackRedirectUrl="/dashboard"
                                signUpUrl="/auth?mode=signup"
                                routing="hash"
                            />
                        ) : (
                            <SignUp
                                appearance={CLERK_APPEARANCE}
                                fallbackRedirectUrl="/dashboard"
                                signInUrl="/auth?mode=signin"
                                routing="hash"
                            />
                        )}
                    </div>
                </div>

                {/* back */}
                <Link
                    to="/"
                    className={`relative z-10 mt-8 text-zinc-600 hover:text-zinc-400 text-xs transition-all duration-300 delay-200 ${
                        mounted ? "opacity-100" : "opacity-0"
                    }`}
                >
                    ← Back to home
                </Link>
            </div>
        </div>
    );
}
