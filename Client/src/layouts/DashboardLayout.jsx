import { Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useUser, UserButton } from "@clerk/react";
import { LayoutDashboard, BarChart3, TrendingUp, PlusCircle, ArrowLeft, Gauge } from "lucide-react";
import { DASHBOARD_NAV } from "../constants/siteContent";

const ICONS = { LayoutDashboard, BarChart3, TrendingUp, PlusCircle, Gauge };

export default function DashboardLayout() {
    const { user } = useUser();
    const matchRoute = useMatchRoute();

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* ── SIDEBAR ── */}
            <aside className="hidden md:flex w-60 flex-col border-r border-zinc-900 bg-black/95 p-4 justify-between fixed inset-y-0 left-0 z-40">
                {/* top */}
                <div>
                    {/* logo */}
                    <Link to="/" className="flex items-center gap-2.5 mb-8 group">
                        <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center transition-transform group-hover:scale-95">
                            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                                <path d="M3 14L9 4L15 14" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5.5 10.5H12.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="text-white font-semibold text-sm font-mono">IonPoll</span>
                    </Link>

                    {/* nav */}
                    <nav className="flex flex-col gap-1">
                        {DASHBOARD_NAV.map(({ label, to, icon }) => {
                            const Icon = ICONS[icon];
                            const isActive = matchRoute({ to, fuzzy: false });
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                                        isActive
                                            ? "bg-zinc-800 text-white"
                                            : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                                    }`}
                                >
                                    {Icon && <Icon size={16} />}
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* bottom — user */}
                <div className="space-y-4">
                    {/* user */}
                    <div className="flex items-center gap-3 px-2">
                        <UserButton afterSignOutUrl="/" appearance={{
                            elements: {
                                avatarBox: "w-8 h-8",
                            }
                        }} />
                        <div className="min-w-0">
                            <p className="text-white text-xs font-medium truncate">{user?.fullName || "User"}</p>
                            <p className="text-zinc-600 text-[10px] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── MOBILE TOP BAR ── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 h-14 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <ArrowLeft size={16} className="text-zinc-400" />
                    <span className="text-white text-sm font-mono font-semibold">IonPoll</span>
                </Link>
                <UserButton afterSignOutUrl="/" />
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-zinc-900 px-2 py-2 flex justify-around">
                {DASHBOARD_NAV.map(({ label, to, icon }) => {
                    const Icon = ICONS[icon];
                    const isActive = matchRoute({ to, fuzzy: false });
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] transition-colors ${
                                isActive ? "text-white" : "text-zinc-600"
                            }`}
                        >
                            {Icon && <Icon size={18} />}
                            {label}
                        </Link>
                    );
                })}
            </div>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 md:ml-60 min-h-screen">
                <div className="px-6 py-8 md:py-10 mt-14 md:mt-0 mb-16 md:mb-0 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
