import { useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { FooterSection } from "../components/landing/CTABanner";
import { CONTACT_FORM_FIELDS, CONTACT_FAQ, CONTACT_SOCIALS } from "../constants/siteContent";
import { ChevronDown, Send, Mail } from "lucide-react";

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-zinc-900">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <span className="text-white text-sm font-medium group-hover:text-zinc-300 transition-colors">{q}</span>
                <ChevronDown
                    size={16}
                    className={`text-zinc-500 transition-transform duration-200 flex-shrink-0 ml-4 ${open ? "rotate-180" : ""}`}
                />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-4" : "max-h-0"}`}>
                <p className="text-zinc-500 text-sm leading-relaxed">{a}</p>
            </div>
        </div>
    );
}

export default function ContactPage() {
    const [formData, setFormData] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: connect to backend API
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="min-h-screen w-full bg-black text-white">
            <NavigationBar />

            <section className="px-6 pt-28 pb-16 max-w-4xl mx-auto text-center">
                <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mb-3">Contact</p>
                <h1
                    className="text-5xl md:text-6xl font-black tracking-tighter mb-6"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                    Get in touch.
                </h1>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                    Got a question, feature request, or just want to say hello? We'd love to hear from you.
                </p>
            </section>

            <section className="px-6 pb-20 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* ── FORM ── */}
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-6">Send a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {CONTACT_FORM_FIELDS.map((field) => (
                            <div key={field.id}>
                                <label className="block text-zinc-400 text-xs uppercase tracking-widest font-mono mb-2">
                                    {field.label}
                                    {field.required && <span className="text-zinc-600 ml-1">*</span>}
                                </label>
                                {field.type === "textarea" ? (
                                    <textarea
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        rows={5}
                                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors resize-none"
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors"
                                    />
                                )}
                            </div>
                        ))}
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all duration-150"
                        >
                            {submitted ? "Sent! ✓" : <>Send message <Send size={14} /></>}
                        </button>
                    </form>
                </div>

                {/* ── SIDEBAR (FAQ + socials) ── */}
                <div>
                    {/* socials */}
                    <h2 className="text-xl font-bold tracking-tight mb-6">Other ways to reach us</h2>
                    <div className="space-y-3 mb-12">
                        {CONTACT_SOCIALS.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-600 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                                    <Mail size={14} className="text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-white text-xs font-medium">{s.label}</p>
                                    <p className="text-zinc-500 text-[10px]">{s.value}</p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* FAQ */}
                    <h2 className="text-xl font-bold tracking-tight mb-6">Frequently asked</h2>
                    <div>
                        {CONTACT_FAQ.map((item) => (
                            <FAQItem key={item.q} {...item} />
                        ))}
                    </div>
                </div>
            </section>

            <FooterSection />
        </div>
    );
}
