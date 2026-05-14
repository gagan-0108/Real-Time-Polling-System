import { useEffect, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { SignIn, SignUp } from "@clerk/react";
import { Zap, Shield, BarChart3, Clock, Megaphone, ArrowLeft } from "lucide-react";

// ── Clerk dark appearance — fully transparent, all dark ───
const CLERK_APPEARANCE = {
    variables: {
        colorBackground: "transparent",
        colorInputBackground: "#18181b",
        colorInputText: "#ffffff",
        colorText: "#ffffff",
        colorTextSecondary: "#71717a",
        colorTextOnPrimaryBackground: "#000000",
        colorPrimary: "#ffffff",
        colorDanger: "#f87171",
        colorSuccess: "#34d399",
        borderRadius: "0.75rem",
        fontFamily: "'DM Mono', monospace",
        spacingUnit: "1rem",
    },
    elements: {
        rootBox: "w-full",
        cardBox: "shadow-none w-full bg-transparent",
        card: "shadow-none bg-transparent border-none w-full p-0 m-0",
        headerTitle: "hidden",
        headerSubtitle: "hidden",
        formFieldLabel: "!text-zinc-400 text-xs uppercase tracking-widest",
        formFieldInput:
            "!bg-zinc-900 !border-zinc-700 !text-white placeholder:!text-zinc-600 focus:!border-zinc-500 !rounded-xl !shadow-none !h-12 !text-sm",
        formFieldHintText: "!text-zinc-600 text-xs",
        formFieldErrorText: "!text-red-400 text-xs",
        formButtonPrimary:
            "!bg-white !text-black !font-bold hover:!bg-zinc-200 !transition-all !rounded-xl !shadow-none !border-none !h-12 !text-sm",
        socialButtonsBlockButton:
            "!bg-zinc-900 !border-zinc-700 hover:!bg-zinc-800 !text-white !rounded-xl !shadow-none !h-12",
        socialButtonsBlockButtonText: "!text-zinc-300 !font-medium !text-sm",
        socialButtonsIconButton:
            "!bg-zinc-900 !border-zinc-700 hover:!bg-zinc-800 !rounded-xl !shadow-none",
        dividerLine: "!bg-zinc-800",
        dividerText: "!text-zinc-600 !text-xs",
        footerActionLink: "!text-zinc-400 hover:!text-white !text-sm",
        footerActionText: "!text-zinc-600 !text-sm",
        footer: "!bg-transparent !border-none !pt-4",
        identityPreviewText: "!text-white",
        identityPreviewEditButton: "!text-zinc-400 hover:!text-white",
        formResendCodeLink: "!text-zinc-400 hover:!text-white",
        otpCodeFieldInput: "!bg-zinc-900 !border-zinc-700 !text-white !h-12",
        alternativeMethodsBlockButton:
            "!bg-zinc-900 !border-zinc-700 hover:!bg-zinc-800 !text-zinc-300 !rounded-xl !h-12",
        alertText: "!text-red-400 text-xs",
        badge: "!bg-zinc-800 !text-zinc-500 !text-[10px]",
        main: "gap-6",
    },
    layout: {
        socialButtonsPlacement: "top",
        showOptionalFields: false,
    },
};

// ── features ──────────────────────────────────────────────
const FEATURES = [
    { icon: Zap, label: "Live response counts", desc: "See votes the instant they happen", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    { icon: Shield, label: "Anonymous & auth modes", desc: "Choose how your audience participates", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    { icon: BarChart3, label: "Analytics dashboard", desc: "Deep insights into every response", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { icon: Clock, label: "Expiry control", desc: "Set timed polls that auto-close", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
    { icon: Megaphone, label: "One-click publish", desc: "Share results instantly with anyone", color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" },
];

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
            <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-14 overflow-hidden">
                {/* gradient mesh */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[100px]" />
                    <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-emerald-600/5 blur-[80px]" />
                </div>

                {/* grid */}
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
                <Link to="/" className="relative z-10 flex items-center gap-2.5 group w-fit">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-95">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M3 14L9 4L15 14" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5.5 10.5H12.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="text-white font-semibold text-xl font-mono tracking-tight">IonPoll</span>
                </Link>

                {/* tagline + features */}
                <div className="relative z-10">
                    <h2
                        className="text-6xl font-black tracking-tighter leading-[1.05] text-white mb-4"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Polls that
                        <br />
                        <span className="bg-linear-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                            think live.
                        </span>
                    </h2>
                    <p className="text-zinc-500 text-base leading-relaxed max-w-sm mb-12">
                        Create, share and analyze polls with real-time updates.
                        Your audience responds — you see it instantly.
                    </p>

                    {/* feature cards */}
                    <div className="flex flex-col gap-3">
                        {FEATURES.map((f, i) => (
                            <div
                                key={f.label}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl border ${f.border} ${f.bg} backdrop-blur-sm w-full max-w-md transition-all duration-300 hover:scale-[1.01]`}
                                style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: `all 0.5s ease ${i * 100}ms` }}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${f.bg}`}>
                                    <f.icon size={16} className={f.color} />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-semibold">{f.label}</p>
                                    <p className="text-zinc-500 text-xs">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-zinc-700 text-xs font-mono">
                    © 2025 IonPoll — Real-time polling platform
                </p>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-10 relative">
                {/* vertical border accent */}
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-zinc-800 to-transparent" />

                {/* mobile top bar */}
                <div className="lg:hidden flex items-center justify-between w-full mb-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                                <path d="M3 14L9 4L15 14" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5.5 10.5H12.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="text-white font-semibold font-mono">IonPoll</span>
                    </Link>
                    <Link to="/" className="text-zinc-500 hover:text-white text-xs flex items-center gap-1">
                        <ArrowLeft size={12} /> Home
                    </Link>
                </div>

                {/* auth container */}
                <div className="w-full max-w-md">
                    {/* heading */}
                    <div
                        className={`mb-8 transition-all duration-500 ${
                            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}
                    >
                        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                            {isSignIn ? "Welcome back" : "Create your account"}
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            {isSignIn
                                ? "Sign in to your IonPoll account to manage your polls."
                                : "Get started with real-time polling — it's free."}
                        </p>
                    </div>

                    {/* mode toggle */}
                    <div
                        className={`mb-8 flex items-center bg-zinc-900/60 border border-zinc-800 rounded-2xl p-1 transition-all duration-500 delay-75 ${
                            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}
                    >
                        <Link
                            to="/auth"
                            search={{ mode: "signin" }}
                            className={`flex-1 text-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                isSignIn
                                    ? "bg-white text-black shadow-lg shadow-white/5"
                                    : "text-zinc-500 hover:text-white"
                            }`}
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/auth"
                            search={{ mode: "signup" }}
                            className={`flex-1 text-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                !isSignIn
                                    ? "bg-white text-black shadow-lg shadow-white/5"
                                    : "text-zinc-500 hover:text-white"
                            }`}
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* Clerk form */}
                    <div
                        className={`transition-all duration-500 delay-150 ${
                            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        }`}
                    >
                        <div className="clerk-dark-wrapper rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
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

                    {/* back link — desktop only */}
                    <div
                        className={`hidden lg:block mt-6 text-center transition-all duration-300 delay-200 ${
                            mounted ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <Link
                            to="/"
                            className="text-zinc-600 hover:text-zinc-400 text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                            <ArrowLeft size={12} />
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
