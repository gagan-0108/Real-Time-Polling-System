import { useState, useEffect } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useUser, useAuth } from "@clerk/react";
import { Lock, Clock, User, Globe, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { createApiClient } from "../../hooks/useApi";
import { usePollRoom } from "../../hooks/useSocket";
import NavigationBar from "../../components/NavigationBar";

function CountdownTimer({ expiresAt }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calc = () => {
            const diff = new Date(expiresAt) - Date.now();
            if (diff <= 0) return setTimeLeft("Expired");
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(
                `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
            );
        };
        calc();
        const id = setInterval(calc, 1000);
        return () => clearInterval(id);
    }, [expiresAt]);

    return (
        <span className="font-mono text-lg font-black tracking-tighter text-white">{timeLeft}</span>
    );
}

function LockedNotice() {
    return (
        <div className="max-w-md mx-auto text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                <Lock size={24} className="text-zinc-500" />
            </div>
            <h2 className="text-xl font-black text-white mb-2 tracking-tight">Authentication Required</h2>
            <p className="text-zinc-500 text-sm mb-6">
                This poll requires you to sign in before participating. Only verified users can submit responses.
            </p>
            <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all"
            >
                Sign in to participate →
            </Link>
        </div>
    );
}

export default function PollView() {
    const { pollId } = useParams({ strict: false });
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const { responseCount, isLive } = usePollRoom(pollId);

    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        const fetchPoll = async () => {
            setLoading(true);
            try {
                const api = createApiClient(null); // Public endpoint, no token needed
                const data = await api.polls.getPublic(pollId);
                setPoll(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (pollId) fetchPoll();
    }, [pollId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <NavigationBar />
                <div className="flex items-center justify-center pt-32">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !poll) {
        return (
            <div className="min-h-screen bg-black text-white">
                <NavigationBar />
                <div className="text-center pt-32">
                    <p className="text-zinc-500 text-sm">{error || "Poll not found"}</p>
                </div>
            </div>
        );
    }

    const isLocked = poll.mode === "authenticated" && !isSignedIn;
    const isExpired = poll.status === "expired" || poll.status === "published" || (poll.expiresAt && new Date(poll.expiresAt) < Date.now());

    const handleSelect = (qId, optIdx) => {
        setAnswers((a) => ({ ...a, [qId]: optIdx }));
    };

    const mandatoryComplete = poll.questions
        .filter((q) => q.mandatory)
        .every((q) => answers[q.id] !== undefined);

    const handleSubmit = async () => {
        if (!mandatoryComplete || submitting) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const token = isSignedIn ? await getToken() : null;
            const api = createApiClient(token);
            await api.responses.submit(pollId, answers);
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <NavigationBar />

            <div className="max-w-2xl mx-auto px-6 pt-24 pb-16">
                {/* cover */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm text-zinc-400">
                            <User size={16} />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Poll</p>
                            <p className="text-zinc-500 text-[10px] font-mono">
                                {isLive && <span className="text-emerald-400">● Live</span>}
                                {responseCount > 0 && ` · ${responseCount} responses`}
                            </p>
                        </div>
                    </div>

                    <h1
                        className="text-3xl font-black tracking-tighter mb-2"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        {poll.title}
                    </h1>
                    {poll.description && (
                        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{poll.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                            {poll.mode === "authenticated" ? <Lock size={12} /> : <Globe size={12} />}
                            {poll.mode === "authenticated" ? "Authenticated" : "Anonymous"}
                        </span>
                        {poll.expiresAt && (
                            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <Clock size={12} /> <CountdownTimer expiresAt={poll.expiresAt} />
                            </span>
                        )}
                        <span className="text-xs text-zinc-600">{poll.questions.length} questions</span>
                    </div>
                </div>

                {/* expired notice */}
                {isExpired && (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 mb-6 flex items-center gap-3">
                        <AlertTriangle size={16} className="text-zinc-500 shrink-0" />
                        <p className="text-zinc-400 text-sm">This poll has expired. No further responses are accepted.</p>
                    </div>
                )}

                {/* locked */}
                {isLocked && !isExpired && <LockedNotice />}

                {/* submitted */}
                {submitted && (
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-6 text-center">
                        <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
                        <h2 className="text-white font-bold text-lg mb-1">Response submitted!</h2>
                        <p className="text-zinc-400 text-sm">Thank you for participating. Results will be published once the poll closes.</p>
                    </div>
                )}

                {/* questions */}
                {!isLocked && !isExpired && !submitted && (
                    <>
                        <div className="space-y-4 mb-6">
                            {poll.questions.map((q, qIdx) => (
                                <div key={q.id} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-zinc-500 text-[10px] font-mono">Q{qIdx + 1}</span>
                                        {q.mandatory && (
                                            <span className="text-[10px] text-red-400 font-mono uppercase">Required</span>
                                        )}
                                    </div>
                                    <p className="text-white text-sm font-medium mb-4">{q.text}</p>
                                    <div className="space-y-2">
                                        {q.options.map((opt, optIdx) => (
                                            <button
                                                key={optIdx}
                                                onClick={() => handleSelect(q.id, optIdx)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 ${
                                                    answers[q.id] === optIdx
                                                        ? "border-white/30 bg-white/5 text-white"
                                                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                                                }`}
                                            >
                                                <span className={`w-4 h-4 rounded-full border shrink-0 transition-colors ${
                                                    answers[q.id] === optIdx
                                                        ? "border-white bg-white"
                                                        : "border-zinc-600"
                                                }`} />
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {submitError && (
                            <p className="text-red-400 text-xs text-center mb-3">{submitError}</p>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!mandatoryComplete || submitting}
                            className={`w-full py-4 text-sm font-bold rounded-xl transition-all ${
                                mandatoryComplete && !submitting
                                    ? "bg-white text-black hover:bg-zinc-200"
                                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            }`}
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Submitting…
                                </span>
                            ) : (
                                "Submit Response →"
                            )}
                        </button>
                        {!mandatoryComplete && (
                            <p className="text-zinc-600 text-xs text-center mt-2">Answer all required questions to submit</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
