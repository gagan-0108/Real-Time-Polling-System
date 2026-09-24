//  landingData.js  –  single source of truth
//  All hardcoded content for the landing page

export const NAV_LINKS = [
    { label: "Pricing", to: "/pricing" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
];

export const STATS = [
    { value: "<150ms", label: "Live Latency" },
    { value: "100%", label: "Free to Start" },
];

// preview: key matched in HoverPreview.jsx
export const FEATURES = [
    {
        id: "create",
        icon: "🗳",
        title: "Dynamic Poll Builder",
        desc: "Add multiple questions, mark mandatory fields, set response modes — all in one smooth flow.",
        preview: "poll",
    },
    {
        id: "realtime",
        icon: "⚡",
        title: "Real-time Updates",
        desc: "Socket.io streams every response live. Your dashboard refreshes without a single reload.",
        preview: "live",
    },
    {
        id: "modes",
        icon: "🔒",
        title: "Anonymous & Authenticated",
        desc: "Toggle between anonymous or login-required responses per poll — total control.",
        preview: "anonymous",
    },
    {
        id: "expiry",
        icon: "⏱",
        title: "Expiry Control",
        desc: "Set a deadline. Once the timer hits, the poll locks and refuses all further responses.",
        preview: "expiry",
    },
    {
        id: "analytics",
        icon: "📊",
        title: "Rich Insights",
        desc: "Total responses, per-question breakdowns, option counts and participation trends.",
        preview: "analytics",
    },
    {
        id: "publish",
        icon: "📢",
        title: "Publish Results",
        desc: "Go public when ready. Anyone on the poll link sees final outcomes and summaries.",
        preview: "publish",
    },
];

export const HOW_IT_WORKS = [
    {
        num: "01",
        title: "Create",
        desc: "Build your poll, add questions, set expiry and choose who can respond.",
    },
    {
        num: "02",
        title: "Share",
        desc: "Copy the generated link. Send it anywhere — Slack, email, social, anywhere.",
    },
    {
        num: "03",
        title: "Analyze",
        desc: "Watch live analytics roll in. Publish the final results when you're done.",
    },
];



export const PREVIEW_POLL = {
    question: "Which JS framework do you prefer?",
    options: ["React", "Vue", "Svelte", "Angular"],
    selected: 1, // Vue pre-selected for visual flair
};

export const PREVIEW_ANALYTICS = {
    question: "Best state management tool?",
    bars: [
        { label: "Zustand", pct: 46, count: 58 },
        { label: "Redux", pct: 29, count: 37 },
        { label: "Jotai", pct: 16, count: 20 },
        { label: "MobX", pct: 9, count: 11 },
    ],
    total: 126,
};

export const PREVIEW_PUBLISH = {
    title: "Framework Preference — Final Results",
    winner: "React",
    pct: "42%",
    total: "248 responses",
    bars: [
        { label: "React", pct: 42 },
        { label: "Vue", pct: 33 },
        { label: "Svelte", pct: 25 },
    ],
};
