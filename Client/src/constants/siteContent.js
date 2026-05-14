// ─────────────────────────────────────────────────────────
//  siteContent.js — all placeholder content for static pages
//  About, Contact, Footer, Dashboard sidebar, Auth copy
// ─────────────────────────────────────────────────────────

// ── ABOUT PAGE ───────────────────────────────────────────
export const ABOUT_HERO = {
    headline: "Built for real feedback.",
    subline: "IonPoll started as a weekend hack. Now it powers thousands of real-time polls for teams, creators, and communities worldwide.",
};

export const ABOUT_MISSION = {
    title: "Our Mission",
    body: "We believe decisions are better when everyone has a voice. IonPoll makes it effortless to ask questions, collect responses in real time, and act on the results — whether you're running a team retro, gathering product feedback, or polling your audience live.",
};

export const ABOUT_VALUES = [
    {
        icon: "⚡",
        title: "Speed First",
        desc: "Sub-2ms latency on every response. Your audience sees updates the instant they happen.",
    },
    {
        icon: "🔒",
        title: "Privacy by Design",
        desc: "Anonymous mode means truly anonymous — we never store identifiers for anonymous respondents.",
    },
    {
        icon: "📊",
        title: "Data You Can Act On",
        desc: "Rich analytics, per-question breakdowns, and exportable results so nothing goes to waste.",
    },
    {
        icon: "🌐",
        title: "Open & Shareable",
        desc: "Every poll gets a public link. No app downloads, no sign-ups required to respond.",
    },
];

export const ABOUT_ROADMAP = [
    { quarter: "Q3 2025", label: "Beta Launch", status: "done" },
    { quarter: "Q4 2025", label: "Analytics Dashboard v2", status: "done" },
    { quarter: "Q1 2026", label: "REST API & Webhooks", status: "current" },
    { quarter: "Q2 2026", label: "Team Workspaces", status: "upcoming" },
    { quarter: "Q3 2026", label: "White-label Embeds", status: "upcoming" },
];

export const ABOUT_TEAM = [
    { name: "Gagan", role: "Founder & Full-Stack Dev", avatar: null },
    { name: "Open Position", role: "Backend Engineer", avatar: null },
    { name: "Open Position", role: "Designer", avatar: null },
];

// ── CONTACT PAGE ─────────────────────────────────────────
export const CONTACT_FORM_FIELDS = [
    { id: "name", label: "Your Name", type: "text", placeholder: "Jane Doe", required: true },
    { id: "email", label: "Email", type: "email", placeholder: "jane@example.com", required: true },
    { id: "subject", label: "Subject", type: "text", placeholder: "Bug report, feature request, general…", required: true },
    { id: "message", label: "Message", type: "textarea", placeholder: "Tell us what's on your mind…", required: true },
];

export const CONTACT_FAQ = [
    {
        q: "Is IonPoll really free?",
        a: "Yes — the Free tier gives you 5 authenticated polls and 2 anonymous polls per month, with basic analytics. No credit card required.",
    },
    {
        q: "How does real-time work?",
        a: "We use Socket.io to push every response to your dashboard the instant it's submitted. No polling, no refresh needed.",
    },
    {
        q: "Can I export my poll data?",
        a: "Go and Pro plans support CSV and JSON exports. Free tier users can view analytics in-app.",
    },
    {
        q: "What happens when a poll expires?",
        a: "The poll link shows a 'closed' notice. No further submissions are accepted, and the creator can publish final results.",
    },
    {
        q: "Is anonymous mode truly anonymous?",
        a: "Yes. In anonymous mode we do not store any user identifiers with the response. Not even IP addresses.",
    },
];

export const CONTACT_SOCIALS = [
    { label: "Email", value: "support@ionpoll.app", href: "mailto:support@ionpoll.app" },
    { label: "GitHub", value: "github.com/ionpoll", href: "https://github.com/ionpoll" },
    { label: "Twitter / X", value: "@ionpoll", href: "https://x.com/ionpoll" },
];

// ── FOOTER ───────────────────────────────────────────────
export const FOOTER_LINKS = {
    product: [
        { label: "Features", to: "/#features" },
        { label: "Pricing", to: "/pricing" },
        { label: "Changelog", to: "#" },
    ],
    company: [
        { label: "About", to: "/about" },
        { label: "Contact", to: "/contact" },
        { label: "Blog", to: "#" },
    ],
    legal: [
        { label: "Privacy", to: "#" },
        { label: "Terms", to: "#" },
    ],
};

// ── DASHBOARD SIDEBAR ────────────────────────────────────
export const DASHBOARD_NAV = [
    { label: "Overview", to: "/dashboard", icon: "LayoutDashboard" },
    { label: "My Polls", to: "/dashboard/polls", icon: "BarChart3" },
    { label: "Analytics", to: "/dashboard/analytics", icon: "TrendingUp" },
    { label: "Usage", to: "/dashboard/usage", icon: "Gauge" },
    { label: "Create Poll", to: "/dashboard/create", icon: "PlusCircle" },
];

// ── AUTH COPY ────────────────────────────────────────────
export const AUTH_LEFT_FEATURES = [
    "⚡  Live response counts via Socket.io",
    "🔒  Anonymous & authenticated modes",
    "📊  Analytics dashboard built-in",
    "⏱   Expiry control per poll",
    "📢  One-click publish final results",
];
