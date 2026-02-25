
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/lib/queryClient';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./app/App";
import "./styles/index.css";
import { SpeedInsights } from "@vercel/speed-insights/next"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </GoogleOAuthProvider>
);
