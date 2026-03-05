import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/app/lib/api';
import { queryKeys } from '@/app/lib/queryKeys';
import { Event } from '@/app/context/AppContext';

export const useEvents = () => {
    return useQuery({
        queryKey: queryKeys.events.all,
        queryFn: async () => {
            const res = await eventsApi.getAll();
            return (Array.isArray(res) ? res : []) as Event[];
        },
    });
};
