import React from 'react';

const Pulse: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`bg-white/5 animate-pulse rounded-xl ${className}`} />
);

/* ─── Product Grid Skeleton ──────────────────────── */
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
                <Pulse className="w-full aspect-square rounded-none" />
                <div className="p-4 space-y-3">
                    <Pulse className="h-4 w-3/4" />
                    <Pulse className="h-3 w-1/2" />
                    <div className="flex justify-between items-center pt-2">
                        <Pulse className="h-5 w-24" />
                        <Pulse className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

/* ─── Category Cards Skeleton ────────────────────── */
export const CategoryGridSkeleton: React.FC<{ count?: number }> = ({ count = 7 }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/5 p-6 flex flex-col items-center gap-3">
                <Pulse className="w-12 h-12 rounded-xl" />
                <Pulse className="h-4 w-20" />
                <Pulse className="h-3 w-14" />
            </div>
        ))}
    </div>
);

/* ─── Product Detail Skeleton ────────────────────── */
export const ProductDetailSkeleton: React.FC = () => (
    <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4">
            <Pulse className="h-4 w-32 mb-8" />
            <div className="grid lg:grid-cols-2 gap-12">
                {/* Image */}
                <div className="space-y-4">
                    <Pulse className="w-full aspect-square rounded-2xl" />
                    <div className="flex gap-3">
                        {[1, 2, 3, 4].map(i => <Pulse key={i} className="w-20 h-20 rounded-lg" />)}
                    </div>
                </div>
                {/* Info */}
                <div className="space-y-6">
                    <Pulse className="h-8 w-3/4" />
                    <Pulse className="h-5 w-1/3" />
                    <Pulse className="h-10 w-1/2" />
                    <div className="space-y-2">
                        <Pulse className="h-3 w-full" />
                        <Pulse className="h-3 w-full" />
                        <Pulse className="h-3 w-2/3" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Pulse className="h-12 flex-1" />
                        <Pulse className="h-12 flex-1" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/* ─── Events List Skeleton ───────────────────────── */
export const EventsListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
                <Pulse className="w-full h-48 rounded-none" />
                <div className="p-5 space-y-3">
                    <Pulse className="h-5 w-2/3" />
                    <Pulse className="h-3 w-full" />
                    <Pulse className="h-3 w-3/4" />
                    <div className="flex justify-between pt-3">
                        <Pulse className="h-4 w-24" />
                        <Pulse className="h-8 w-20 rounded-lg" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

/* ─── Rewards/Voucher Cards Skeleton ─────────────── */
export const RewardsGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/5 p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <Pulse className="w-14 h-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Pulse className="h-4 w-3/4" />
                        <Pulse className="h-3 w-1/2" />
                    </div>
                </div>
                <Pulse className="h-3 w-full" />
                <div className="flex justify-between items-center pt-2">
                    <Pulse className="h-4 w-20" />
                    <Pulse className="h-9 w-24 rounded-lg" />
                </div>
            </div>
        ))}
    </div>
);

/* ─── Home Page Skeleton ─────────────────────────── */
export const HomePageSkeleton: React.FC = () => (
    <div className="min-h-screen bg-black pt-20">
        {/* Banner */}
        <Pulse className="w-full h-[500px] rounded-none" />
        {/* Products section */}
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <Pulse className="h-8 w-48" />
                <Pulse className="h-8 w-24 rounded-lg" />
            </div>
            <ProductGridSkeleton count={4} />
        </div>
    </div>
);

/* ─── Promo Page Skeleton ────────────────────────── */
export const PromoPageSkeleton: React.FC = () => (
    <div className="space-y-8">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/5">
            <Pulse className="h-6 w-48 mb-4" />
            <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Pulse key={i} className="h-16 w-16 rounded-xl" />
                ))}
            </div>
        </div>
        <ProductGridSkeleton count={6} />
    </div>
);

/* ─── Filter Bar Skeleton ────────────────────────── */
export const FilterBarSkeleton: React.FC = () => (
    <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
            <Pulse key={i} className="h-10 w-24 shrink-0 rounded-full" />
        ))}
    </div>
);
