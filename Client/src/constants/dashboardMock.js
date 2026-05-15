
//  dashboardMock.js — mock data for dashboard UI
//  Replace with real API calls once backend is ready


// overview stats
export const OVERVIEW_STATS = [
    { label: "Total Polls", value: "24", change: "+3 this week", trend: "up" },
    { label: "Active Polls", value: "6", change: "2 expiring today", trend: "neutral" },
    { label: "Total Responses", value: "1,847", change: "+312 this week", trend: "up" },
    { label: "Avg. Completion", value: "87%", change: "+2% vs last week", trend: "up" },
];

// response trend 
export const RESPONSE_TREND = [
    { day: "Mon", responses: 42 },
    { day: "Tue", responses: 78 },
    { day: "Wed", responses: 56 },
    { day: "Thu", responses: 124 },
    { day: "Fri", responses: 93 },
    { day: "Sat", responses: 67 },
    { day: "Sun", responses: 31 },
];

// recent activity
export const RECENT_ACTIVITY = [
    { id: 1, type: "response", text: 'New response on "JS Framework Poll"', time: "2 min ago" },
    { id: 2, type: "create", text: 'You created "Sprint Retro Q2"', time: "1 hour ago" },
    { id: 3, type: "publish", text: '"Design Survey" results published', time: "3 hours ago" },
    { id: 4, type: "expire", text: '"Quick Feedback" poll expired', time: "5 hours ago" },
    { id: 5, type: "response", text: '12 new responses on "Product Roadmap Vote"', time: "Yesterday" },
];

// poll list
export const MOCK_POLLS = [
    {
        id: "poll-1",
        title: "Best JS Framework 2025",
        status: "active",
        mode: "authenticated",
        questions: 4,
        responses: 127,
        maxResponses: 500,
        createdAt: "2025-05-10T10:00:00Z",
        expiresAt: "2025-05-20T10:00:00Z",
    },
    {
        id: "poll-2",
        title: "Sprint Retro — Week 19",
        status: "active",
        mode: "anonymous",
        questions: 3,
        responses: 8,
        maxResponses: 50,
        createdAt: "2025-05-12T14:00:00Z",
        expiresAt: "2025-05-13T18:00:00Z",
    },
    {
        id: "poll-3",
        title: "Product Feedback Survey",
        status: "expired",
        mode: "authenticated",
        questions: 6,
        responses: 248,
        maxResponses: 500,
        createdAt: "2025-04-28T09:00:00Z",
        expiresAt: "2025-05-05T09:00:00Z",
    },
    {
        id: "poll-4",
        title: "Team Lunch Preference",
        status: "published",
        mode: "anonymous",
        questions: 2,
        responses: 34,
        maxResponses: 50,
        createdAt: "2025-05-01T12:00:00Z",
        expiresAt: "2025-05-03T12:00:00Z",
    },
    {
        id: "poll-5",
        title: "Quarterly OKR Priority",
        status: "draft",
        mode: "authenticated",
        questions: 5,
        responses: 0,
        maxResponses: 500,
        createdAt: "2025-05-13T08:00:00Z",
        expiresAt: null,
    },
];

// analytics mock
export const ANALYTICS_OVERVIEW = {
    totalResponses: 1847,
    avgResponseTime: "1m 42s",
    completionRate: 87,
    participationByMode: [
        { name: "Authenticated", value: 72 },
        { name: "Anonymous", value: 28 },
    ],
};

export const POLL_PERFORMANCE = [
    { name: "JS Framework", responses: 127, completion: 92 },
    { name: "Sprint Retro", responses: 8, completion: 100 },
    { name: "Product Feedback", responses: 248, completion: 84 },
    { name: "Team Lunch", responses: 34, completion: 97 },
    { name: "OKR Priority", responses: 0, completion: 0 },
];

export const QUESTION_ANALYTICS = {
    pollTitle: "Best JS Framework 2025",
    questions: [
        {
            id: "q1",
            text: "Which framework do you use most?",
            mandatory: true,
            options: [
                { label: "React", count: 58, pct: 46 },
                { label: "Vue", count: 32, pct: 25 },
                { label: "Svelte", count: 22, pct: 17 },
                { label: "Angular", count: 15, pct: 12 },
            ],
            totalResponses: 127,
        },
        {
            id: "q2",
            text: "How satisfied are you with your current framework?",
            mandatory: true,
            options: [
                { label: "Very satisfied", count: 44, pct: 35 },
                { label: "Satisfied", count: 52, pct: 41 },
                { label: "Neutral", count: 21, pct: 16 },
                { label: "Unsatisfied", count: 10, pct: 8 },
            ],
            totalResponses: 127,
        },
        {
            id: "q3",
            text: "Would you switch frameworks in the next year?",
            mandatory: false,
            options: [
                { label: "Yes, definitely", count: 18, pct: 16 },
                { label: "Maybe", count: 42, pct: 37 },
                { label: "No", count: 53, pct: 47 },
            ],
            totalResponses: 113,
        },
    ],
};

// monthly historical trend
export const MONTHLY_TREND = [
    { month: "Jan", polls: 4, responses: 180 },
    { month: "Feb", polls: 6, responses: 310 },
    { month: "Mar", polls: 3, responses: 120 },
    { month: "Apr", polls: 5, responses: 420 },
    { month: "May", polls: 6, responses: 817 },
];

// plan usage
export const PLAN_USAGE = {
    plan: "free",
    authPollsUsed: 3,
    anonPollsUsed: 1,
    responsesStored: 67,
};

// public poll 
export const MOCK_PUBLIC_POLL = {
    id: "poll-1",
    title: "Best JS Framework 2025",
    description: "Help us figure out what the community prefers. Your vote matters!",
    creator: { name: "Gagan", avatar: null },
    mode: "authenticated",
    status: "active",
    createdAt: "2025-05-10T10:00:00Z",
    expiresAt: "2025-05-20T10:00:00Z",
    questions: [
        {
            id: "q1",
            text: "Which framework do you use most?",
            mandatory: true,
            options: ["React", "Vue", "Svelte", "Angular"],
        },
        {
            id: "q2",
            text: "How satisfied are you with your current framework?",
            mandatory: true,
            options: ["Very satisfied", "Satisfied", "Neutral", "Unsatisfied"],
        },
        {
            id: "q3",
            text: "Would you switch frameworks in the next year?",
            mandatory: false,
            options: ["Yes, definitely", "Maybe", "No"],
        },
    ],
};
