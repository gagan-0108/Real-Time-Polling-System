import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PlusCircle, Trash2, GripVertical, Clock, Lock, Globe, ArrowLeft, Eye, Loader2, Check, Copy, ExternalLink } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";

export default function CreatePoll() {
    const navigate = useNavigate();
    const { api, ready } = useApi();
    const toast = useToast();
    const [publishing, setPublishing] = useState(false);
    const [publishError, setPublishError] = useState(null);
    const [createdPollId, setCreatedPollId] = useState(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const [step, setStep] = useState(0); // 0=details, 1=questions, 2=preview, 3=success

    // Check poll limits on mount
    useEffect(() => {
        if (!ready || !api) return;
        api.user.plan().then((plan) => {
            if (plan.unlimited) return;
            const authAtLimit = plan.authPollsLimit > 0 && plan.authPollsUsed >= plan.authPollsLimit;
            const anonAtLimit = plan.anonPollsLimit > 0 && plan.anonPollsUsed >= plan.anonPollsLimit;
            if (authAtLimit && anonAtLimit) {
                toast.warning("You've reached your poll limit. Upgrade your plan to create more.", 5000);
                setTimeout(() => navigate({ to: "/pricing", search: { upgrade: "true" } }), 1500);
            } else if (authAtLimit) {
                toast.warning(`You've used all ${plan.authPollsLimit} authenticated polls. You can still create anonymous polls.`);
            } else if (anonAtLimit) {
                toast.warning(`You've used all ${plan.anonPollsLimit} anonymous polls. You can still create authenticated polls.`);
            }
        }).catch(() => {});
    }, [ready]);
    const [poll, setPoll] = useState({
        title: "",
        description: "",
        mode: "authenticated",
        expiresIn: "24", // hours
        questions: [
            { id: crypto.randomUUID(), text: "", options: ["", ""], mandatory: true },
        ],
    });

    const addQuestion = () => {
        setPoll((p) => ({
            ...p,
            questions: [
                ...p.questions,
                { id: crypto.randomUUID(), text: "", options: ["", ""], mandatory: false },
            ],
        }));
    };

    const removeQuestion = (qId) => {
        setPoll((p) => ({
            ...p,
            questions: p.questions.filter((q) => q.id !== qId),
        }));
    };

    const updateQuestion = (qId, field, value) => {
        setPoll((p) => ({
            ...p,
            questions: p.questions.map((q) =>
                q.id === qId ? { ...q, [field]: value } : q,
            ),
        }));
    };

    const addOption = (qId) => {
        setPoll((p) => ({
            ...p,
            questions: p.questions.map((q) =>
                q.id === qId ? { ...q, options: [...q.options, ""] } : q,
            ),
        }));
    };

    const removeOption = (qId, optIdx) => {
        setPoll((p) => ({
            ...p,
            questions: p.questions.map((q) =>
                q.id === qId
                    ? { ...q, options: q.options.filter((_, i) => i !== optIdx) }
                    : q,
            ),
        }));
    };

    const updateOption = (qId, optIdx, value) => {
        setPoll((p) => ({
            ...p,
            questions: p.questions.map((q) =>
                q.id === qId
                    ? {
                          ...q,
                          options: q.options.map((o, i) => (i === optIdx ? value : o)),
                      }
                    : q,
            ),
        }));
    };

    const handlePublish = async () => {
        if (!api || publishing) return;
        setPublishing(true);
        setPublishError(null);
        try {
            const payload = {
                title: poll.title,
                description: poll.description || null,
                mode: poll.mode,
                expiresIn: Number(poll.expiresIn) || 24,
                questions: poll.questions.map((q) => ({
                    text: q.text,
                    mandatory: q.mandatory,
                    options: q.options.filter((o) => o.trim() !== ""),
                })),
            };
            const created = await api.polls.create(payload);
            setCreatedPollId(created.id);
            // Auto-copy the shareable link
            const shareUrl = `${window.location.origin}/poll/${created.id}`;
            try {
                await navigator.clipboard.writeText(shareUrl);
                setLinkCopied(true);
            } catch { /* clipboard might fail in some browsers */ }
            setStep(3);
        } catch (err) {
            setPublishError(err.message);
        } finally {
            setPublishing(false);
        }
    };

    const steps = ["Details", "Questions", "Preview"];

    const shareUrl = createdPollId ? `${window.location.origin}/poll/${createdPollId}` : "";

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {}
    };

    return (
        <div>
            {/* header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate({ to: "/dashboard" })}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Create Poll</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">Build, configure, and publish</p>
                </div>
            </div>

            {/* stepper */}
            <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                    <button
                        key={s}
                        onClick={() => setStep(i)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                            step === i
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                        }`}
                    >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            step === i ? "bg-white text-black" : "bg-zinc-800 text-zinc-400"
                        }`}>
                            {i + 1}
                        </span>
                        {s}
                    </button>
                ))}
            </div>

            {/* ── STEP 0: Details ── */}
            {step === 0 && (
                <div className="max-w-xl space-y-6">
                    <div>
                        <label className="block text-zinc-400 text-xs uppercase tracking-widest font-mono mb-2">Poll Title *</label>
                        <input
                            type="text"
                            value={poll.title}
                            onChange={(e) => setPoll({ ...poll, title: e.target.value })}
                            placeholder="e.g., Best JS Framework 2025"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 text-xs uppercase tracking-widest font-mono mb-2">Description</label>
                        <textarea
                            rows={3}
                            value={poll.description}
                            onChange={(e) => setPoll({ ...poll, description: e.target.value })}
                            placeholder="Optional description for your poll…"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    {/* mode */}
                    <div>
                        <label className="block text-zinc-400 text-xs uppercase tracking-widest font-mono mb-3">Response Mode</label>
                        <div className="flex gap-3">
                            {[
                                { value: "authenticated", Icon: Lock, label: "Authenticated", desc: "Only logged-in users" },
                                { value: "anonymous", Icon: Globe, label: "Anonymous", desc: "Anyone can respond" },
                            ].map((m) => (
                                <button
                                    key={m.value}
                                    onClick={() => setPoll({ ...poll, mode: m.value })}
                                    className={`flex-1 p-4 rounded-xl border text-left transition-all duration-150 ${
                                        poll.mode === m.value
                                            ? "border-white/30 bg-white/5"
                                            : "border-zinc-800 hover:border-zinc-700"
                                    }`}
                                >
                                    <m.Icon size={16} className={poll.mode === m.value ? "text-white mb-2" : "text-zinc-500 mb-2"} />
                                    <p className={`text-sm font-medium ${poll.mode === m.value ? "text-white" : "text-zinc-400"}`}>{m.label}</p>
                                    <p className="text-zinc-600 text-xs mt-0.5">{m.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* expiry */}
                    <div>
                        <label className="block text-zinc-400 text-xs uppercase tracking-widest font-mono mb-2">
                            <Clock size={12} className="inline mr-1" /> Expires in
                        </label>
                        <select
                            value={poll.expiresIn}
                            onChange={(e) => setPoll({ ...poll, expiresIn: e.target.value })}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-zinc-600 focus:outline-none transition-colors w-full"
                        >
                            <option value="1">1 hour</option>
                            <option value="6">6 hours</option>
                            <option value="12">12 hours</option>
                            <option value="24">24 hours</option>
                            <option value="48">2 days</option>
                            <option value="168">7 days</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setStep(1)}
                        className="w-full py-3.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all"
                    >
                        Next: Add Questions →
                    </button>
                </div>
            )}

            {/* ── STEP 1: Questions ── */}
            {step === 1 && (
                <div className="max-w-2xl space-y-4">
                    {poll.questions.map((q, qIdx) => (
                        <div key={q.id} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <GripVertical size={14} className="text-zinc-600" />
                                    <span className="text-zinc-500 text-[10px] font-mono">Q{qIdx + 1}</span>
                                    <button
                                        onClick={() => updateQuestion(q.id, "mandatory", !q.mandatory)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border transition-colors ${
                                            q.mandatory
                                                ? "border-white/20 text-white bg-white/5"
                                                : "border-zinc-800 text-zinc-600"
                                        }`}
                                    >
                                        {q.mandatory ? "Required" : "Optional"}
                                    </button>
                                </div>
                                {poll.questions.length > 1 && (
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="p-1 rounded hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                value={q.text}
                                onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                                placeholder="Your question…"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors mb-3"
                            />

                            <div className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full border border-zinc-600 flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                            placeholder={`Option ${optIdx + 1}`}
                                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors"
                                        />
                                        {q.options.length > 2 && (
                                            <button
                                                onClick={() => removeOption(q.id, optIdx)}
                                                className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => addOption(q.id)}
                                className="mt-2 text-zinc-500 hover:text-white text-xs transition-colors"
                            >
                                + Add option
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={addQuestion}
                        className="w-full py-3 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 hover:text-white hover:border-zinc-600 text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <PlusCircle size={16} /> Add Question
                    </button>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => setStep(0)}
                            className="flex-1 py-3.5 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-xl hover:border-zinc-500 transition-all"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={() => setStep(2)}
                            className="flex-1 py-3.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all"
                        >
                            Preview →
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Preview ── */}
            {step === 2 && (
                <div className="max-w-xl">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Eye size={16} className="text-zinc-500" />
                            <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Preview</span>
                        </div>

                        <h2 className="text-xl font-black text-white mb-2">{poll.title || "Untitled Poll"}</h2>
                        {poll.description && <p className="text-zinc-400 text-sm mb-4">{poll.description}</p>}

                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex items-center gap-1 text-xs text-zinc-500">
                                {poll.mode === "authenticated" ? <Lock size={12} /> : <Globe size={12} />}
                                {poll.mode === "authenticated" ? "Authenticated" : "Anonymous"}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-zinc-500">
                                <Clock size={12} /> {poll.expiresIn}h expiry
                            </span>
                        </div>

                        {poll.questions.map((q, i) => (
                            <div key={q.id} className="mb-4 last:mb-0 p-4 rounded-xl border border-zinc-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-zinc-500 text-[10px] font-mono">Q{i + 1}</span>
                                    {q.mandatory && (
                                        <span className="text-[10px] text-white font-mono uppercase">Required</span>
                                    )}
                                </div>
                                <p className="text-white text-sm font-medium mb-3">{q.text || "(empty question)"}</p>
                                <div className="space-y-1.5">
                                    {q.options.map((opt, j) => (
                                        <div key={j} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 text-zinc-400 text-xs">
                                            <span className="w-3 h-3 rounded-full border border-zinc-600 flex-shrink-0" />
                                            {opt || `Option ${j + 1}`}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 py-3.5 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-xl hover:border-zinc-500 transition-all"
                        >
                            ← Edit
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={publishing || !ready}
                            className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all ${publishing ? 'bg-zinc-700 text-zinc-400 cursor-wait' : 'bg-white text-black hover:bg-zinc-200'}`}
                        >
                            {publishing ? (
                                <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Creating…</span>
                            ) : (
                                "Publish Poll 🚀"
                            )}
                        </button>
                        {publishError && (
                            <p className="text-red-400 text-xs text-center mt-2">{publishError}</p>
                        )}
                    </div>
                </div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 3 && createdPollId && (
                <div className="max-w-xl text-center py-12">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Check size={28} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Poll Created!</h2>
                    <p className="text-zinc-400 text-sm mb-8">Share the link below to start collecting responses.</p>

                    {/* shareable link */}
                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-4">
                        <input
                            readOnly
                            value={shareUrl}
                            className="flex-1 bg-transparent text-white text-sm font-mono outline-none select-all"
                            onClick={(e) => e.target.select()}
                        />
                        <button
                            onClick={copyLink}
                            className={`p-2 rounded-lg transition-all duration-150 ${
                                linkCopied
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                            title="Copy link"
                        >
                            {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                    {linkCopied && (
                        <p className="text-emerald-400 text-xs mb-6 animate-pulse">✓ Link copied to clipboard</p>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => window.open(`/poll/${createdPollId}`, "_blank")}
                            className="flex-1 py-3 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-xl hover:border-zinc-500 transition-all flex items-center justify-center gap-2"
                        >
                            <ExternalLink size={14} /> Open Poll
                        </button>
                        <button
                            onClick={() => navigate({ to: "/dashboard/polls" })}
                            className="flex-1 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all"
                        >
                            View My Polls
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
