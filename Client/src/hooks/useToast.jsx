import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 4000) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(
        (message, type, duration) => addToast(message, type, duration),
        [addToast]
    );
    toast.success = (msg, dur) => addToast(msg, "success", dur);
    toast.error = (msg, dur) => addToast(msg, "error", dur);
    toast.warning = (msg, dur) => addToast(msg, "warning", dur);
    toast.info = (msg, dur) => addToast(msg, "info", dur);

    return (
        <ToastContext.Provider value={{ toast, toasts, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx.toast;
}

export function useToastState() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToastState must be used inside <ToastProvider>");
    return { toasts: ctx.toasts, removeToast: ctx.removeToast };
}
