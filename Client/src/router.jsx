import {
    createRouter,
    createRoute,
    createRootRoute,
    redirect,
    Outlet,
} from "@tanstack/react-router";

import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardPolls from "./pages/dashboard/DashboardPolls";
import DashboardAnalytics from "./pages/dashboard/DashboardAnalytics";
import DashboardUsage from "./pages/dashboard/DashboardUsage";
import CreatePoll from "./pages/dashboard/CreatePoll";
import PollView from "./pages/poll/PollView";
import PollResults from "./pages/poll/PollResults";

// ── root layout ──────────────────────────────────────────
const rootRoute = createRootRoute({
    component: () => <Outlet />,
});

// ── PUBLIC ROUTES ────────────────────────────────────────

const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Home,
});

const authRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth",
    component: AuthPage,
    validateSearch: (search) => ({
        mode: search.mode === "signup" ? "signup" : "signin",
    }),
});

const pricingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/pricing",
    component: PricingPage,
    validateSearch: (search) => ({
        upgrade: search.upgrade || undefined,
    }),
});

const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/about",
    component: AboutPage,
});

const contactRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/contact",
    component: ContactPage,
});

// ── POLL PUBLIC ROUTES ───────────────────────────────────

const pollViewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/poll/$pollId",
    component: PollView,
});

const pollResultsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/poll/$pollId/results",
    component: PollResults,
});

// ── PROTECTED: DASHBOARD ─────────────────────────────────
// Auth guard uses Clerk's __clerk_db_jwt cookie presence as
// a client-side heuristic. The real check happens when Clerk
// mounts — if the session is invalid, Clerk handles it.

const dashboardLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/dashboard",
    component: DashboardLayout,
    beforeLoad: async () => {
        // Client-side auth check heuristic:
        // Clerk sets a cookie when the user is signed in.
        // For a more robust check, use Clerk's `useAuth` inside the component.
        // This guard prevents the route from loading at all for obvious non-auth users.
        const hasSession =
            document.cookie.includes("__session") ||
            document.cookie.includes("__clerk");

        if (!hasSession) {
            throw redirect({ to: "/auth", search: { mode: "signin" } });
        }
    },
});

const dashboardIndexRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: "/",
    component: DashboardOverview,
});

const dashboardPollsRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: "/polls",
    component: DashboardPolls,
});

const dashboardAnalyticsRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: "/analytics",
    component: DashboardAnalytics,
});

const dashboardCreateRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: "/create",
    component: CreatePoll,
});

const dashboardUsageRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: "/usage",
    component: DashboardUsage,
});

// ── ROUTE TREE ───────────────────────────────────────────
const routeTree = rootRoute.addChildren([
    homeRoute,
    authRoute,
    pricingRoute,
    aboutRoute,
    contactRoute,
    pollViewRoute,
    pollResultsRoute,
    dashboardLayoutRoute.addChildren([
        dashboardIndexRoute,
        dashboardPollsRoute,
        dashboardAnalyticsRoute,
        dashboardUsageRoute,
        dashboardCreateRoute,
    ]),
]);

export const router = createRouter({ routeTree });
