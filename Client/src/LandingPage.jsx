import HeroSection from "./components/landing/HeroSection";
import FeaturesSection from "./components/landing/FeaturesSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import { CTABanner, FooterSection } from "./components/landing/CTABanner";

/**
 * LandingPage
 * presentational component that assembles all sections
 * receives `onCreatePoll` from the parent page so auth logic
 * stays outside this component (separation of concern)
 */
export default function LandingPage({ onCreatePoll }) {
    return (
        <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
            {/* full-page noise grain */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: "128px",
                }}
            />

            <div className="relative z-10">
                {/* add hero section */}
                <HeroSection onCreatePoll={onCreatePoll} />
                {/* add features section */}
                <FeaturesSection />
                {/* add how it works section */}
                <HowItWorksSection />
                {/* add cta banner */}
                <CTABanner onCreatePoll={onCreatePoll} />
                {/* add footer section */}
                <FooterSection />
            </div>
        </div>
    );
}
