import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth, UserButton } from "@clerk/react";
import { NAV_LINKS } from "../constants/landingData";

function LogoIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path
                d="M3 14L9 4L15 14"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5.5 10.5H12.5"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function HamburgerBar({ open, rotate, hide }) {
    return (
        <span
            className={`block w-5 h-px bg-white transition-all duration-200
        ${rotate === 45 ? "rotate-45 translate-y-[7px]" : ""}
        ${rotate === -45 ? "-rotate-45 -translate-y-[7px]" : ""}
        ${hide ? "opacity-0" : ""}
      `}
        />
    );
}

export default function NavigationBar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { isSignedIn, isLoaded } = useAuth();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-black/95 backdrop-blur-md border-b border-zinc-900"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div
                        className="w-8 h-8 bg-white rounded-sm flex items-center justify-center
                       transition-transform duration-150 group-hover:scale-95"
                    >
                        <LogoIcon />
                    </div>
                    <span className="text-white font-semibold tracking-tight text-base font-mono">
                        IonPoll
                    </span>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(({ label, to }) => (
                        <Link
                            key={label}
                            to={to}
                            className="px-4 py-2 text-sm rounded-lg text-zinc-400 hover:text-white
                         hover:bg-zinc-900 transition-all duration-150 font-medium"
                            activeProps={{
                                className: "text-white bg-zinc-800",
                            }}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Auth buttons — show different content based on login state */}
                <div className="hidden md:flex items-center gap-3">
                    {isLoaded && isSignedIn ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 text-sm text-black font-semibold rounded-lg
                                   bg-white hover:bg-zinc-200 transition-all duration-150"
                            >
                                Dashboard
                            </Link>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8",
                                    },
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <Link
                                to="/auth"
                                search={{ mode: "signin" }}
                                className="px-4 py-2 text-sm text-zinc-300 font-medium rounded-lg
                                   border border-zinc-700 hover:border-zinc-500 hover:text-white
                                   transition-all duration-150"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/auth"
                                search={{ mode: "signup" }}
                                className="px-4 py-2 text-sm text-black font-semibold rounded-lg
                                   bg-white hover:bg-zinc-200 transition-all duration-150"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="md:hidden flex flex-col gap-1.5 p-2"
                    aria-label="Toggle menu"
                >
                    <HamburgerBar open={menuOpen} rotate={menuOpen ? 45 : 0} />
                    <HamburgerBar open={menuOpen} hide={menuOpen} />
                    <HamburgerBar open={menuOpen} rotate={menuOpen ? -45 : 0} />
                </button>
            </div>

            {/* Mobile drawer */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ${
                    menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="px-6 pb-6 pt-2 bg-black/95 border-b border-zinc-900 flex flex-col gap-1">
                    {NAV_LINKS.map(({ label, to }) => (
                        <Link
                            key={label}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            className="py-2.5 px-3 text-zinc-400 hover:text-white hover:bg-zinc-900
                         rounded-lg transition-all text-sm font-medium"
                        >
                            {label}
                        </Link>
                    ))}
                    <div className="border-t border-zinc-900 mt-2 pt-4 flex flex-col gap-2">
                        {isLoaded && isSignedIn ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setMenuOpen(false)}
                                    className="py-2.5 px-3 text-center text-black bg-white rounded-lg
                                       text-sm font-semibold"
                                >
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/auth"
                                    search={{ mode: "signin" }}
                                    onClick={() => setMenuOpen(false)}
                                    className="py-2.5 px-3 text-center text-zinc-300 border border-zinc-700
                                       rounded-lg text-sm font-medium"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth"
                                    search={{ mode: "signup" }}
                                    onClick={() => setMenuOpen(false)}
                                    className="py-2.5 px-3 text-center text-black bg-white rounded-lg
                                       text-sm font-semibold"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
