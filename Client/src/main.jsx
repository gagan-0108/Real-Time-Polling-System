import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/react";
import { ToastProvider } from "./hooks/useToast";
import ToastContainer from "./components/ui/Toast";
import { router } from "./router";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            routerPush={(to) => router.navigate({ to })}
            routerReplace={(to) => router.navigate({ to, replace: true })}
            afterSignOutUrl="/"
        >
            <ToastProvider>
                <RouterProvider router={router} />
                <ToastContainer />
            </ToastProvider>
        </ClerkProvider>
    </React.StrictMode>,
);
