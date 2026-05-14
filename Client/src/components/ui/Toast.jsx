import { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { useToastState } from "../../hooks/useToast";

const ICONS = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const COLORS = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    error: "border-red-500/30 bg-red-500/10 text-red-300",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

function ToastItem({ toast, onClose }) {
    const [visible, setVisible] = useState(false);
    const Icon = ICONS[toast.type] || Info;

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => onClose(toast.id), 200);
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-200 ${
                COLORS[toast.type] || COLORS.info
            } ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
        >
            <Icon size={16} className="shrink-0" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
                onClick={handleClose}
                className="p-0.5 rounded hover:bg-white/10 transition-colors shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    );
}

export default function ToastContainer() {
    const { toasts, removeToast } = useToastState();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-auto">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onClose={removeToast} />
            ))}
        </div>
    );
}
