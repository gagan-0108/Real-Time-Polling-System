
//  siteContent.js — all placeholder content for static page
//  About, Contact, Footer, Dashboard sidebar, Auth copy

// about page
export const ABOUT_HERO = {
    headline: "Built for real feedback.",
    subline: "IonPoll started as a weekend hack. Now it powers real-time polls for teams, creators, and communities.",
};

export const ABOUT_MISSION = {
    title: "Our Mission",
    body: "To make it easy for people to ask, vote, and share opinions in real-time. No friction, no signups chaos, just instant feedback that actually feels alive.",
};

// about values
export const ABOUT_VALUES = [
    {
        icon: "⚡",
        title: "Speed First",
        desc: "Instantaneous response delivery ensures your audience sees updates the moment they happen.",
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

// placeholder roadmap
export const ABOUT_ROADMAP = [
    { quarter: "Q3 2025", label: "Beta Launch", status: "done" },
    { quarter: "Q4 2025", label: "Analytics Dashboard v2", status: "done" },
    { quarter: "Q1 2026", label: "REST API & Webhooks", status: "current" },
    { quarter: "Q2 2026", label: "Team Workspaces", status: "upcoming" },
    { quarter: "Q3 2026", label: "White-label Embeds", status: "upcoming" },
];

// team 
export const ABOUT_TEAM = [
    { name: "Gagan", role: "Full Stack Developer", avatar: null },
];

// for the contact page
export const CONTACT_FORM_FIELDS = [
    { id: "name", label: "Your Name", type: "text", placeholder: "Gagan", required: true, disabled: true },
    { id: "email", label: "Email", type: "email", placeholder: "[EMAIL_ADDRESS]", required: true, disabled: true },
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
    { label: "Email", value: "yadavgagan61@gmail.com", href: "mailto:yadavgagan61@gmail.com" },
    { label: "GitHub", value: "@gagan-0108", href: "https://github.com/gagan-0108" },
    { label: "Twitter / X", value: "@_sky_dev_", href: "https://x.com/_sky_dev_" },
];

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

export const DASHBOARD_NAV = [
    { label: "Overview", to: "/dashboard", icon: "LayoutDashboard" },
    { label: "My Polls", to: "/dashboard/polls", icon: "BarChart3" },
    { label: "Analytics", to: "/dashboard/analytics", icon: "TrendingUp" },
    { label: "Usage", to: "/dashboard/usage", icon: "Gauge" },
    { label: "Create Poll", to: "/dashboard/create", icon: "PlusCircle" },
];

// auth features
export const AUTH_LEFT_FEATURES = [
    "⚡  Live response counts via Socket.io",
    "🔒  Anonymous & authenticated modes",
    "📊  Analytics dashboard built-in",
    "⏱   Expiry control per poll",
    "📢  One-click publish final results",
];
