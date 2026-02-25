
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/lib/queryClient';
import App from "./app/App";
import "./styles/index.css";
import { SpeedInsights } from "@vercel/speed-insights/next"

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
);
