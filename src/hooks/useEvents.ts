import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/app/lib/api';
import { queryKeys } from '@/app/lib/queryKeys';
import { Event } from '@/app/context/AppContext';

function mapEvent(raw: any): Event {
    return {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        type: raw.type?.toLowerCase() as Event['type'],
        reward: {
            type: (raw.rewardType?.toLowerCase() || raw.reward?.type || 'points') as 'points' | 'discount' | 'voucher',
            value: raw.rewardValue ?? raw.reward?.value ?? 0,
            voucherId: raw.reward?.voucherId,
        },
        conditions: raw.conditions || {},
        startDate: raw.startDate,
        endDate: raw.endDate,
        isActive: raw.isActive,
        image: raw.image || '',
        progress: raw.progress,
    };
}

export const useEvents = () => {
    return useQuery({
        queryKey: queryKeys.events.all,
        queryFn: async () => {
            const res = await eventsApi.getAll();
            const events = Array.isArray(res) ? res : [];
            return events.map(mapEvent);
        },
    });
};
