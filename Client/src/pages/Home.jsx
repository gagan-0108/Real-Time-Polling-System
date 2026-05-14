import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@clerk/react";
import NavigationBar from "../components/NavigationBar";
import LandingPage from "../LandingPage";

/**
 * Home (page)
 * Owns the auth-aware "create poll" handler and mounts
 * the NavigationBar + LandingPage presentational tree.
 */
export default function Home() {
    const navigate = useNavigate();
    const { isSignedIn } = useAuth();

    const handleCreatePoll = () => {
        if (isSignedIn) {
            navigate({ to: "/dashboard/create" });
        } else {
            navigate({ to: "/auth", search: { mode: "signup" } });
        }
    };

    return (
        <>
            <NavigationBar />
            <LandingPage onCreatePoll={handleCreatePoll} />
        </>
    );
}
