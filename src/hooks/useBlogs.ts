import { useQuery } from '@tanstack/react-query';
import { blogsApi } from '@/app/lib/api';
import { queryKeys } from '@/app/lib/queryKeys';
import { BlogPost } from '@/app/context/AppContext';

// Helper to map API response to AppContext BlogPost type
export const mapBlogPost = (p: any): BlogPost => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? '',
    content: p.content ?? '',
    coverImage: p.coverImage ?? '',
    authorName: p.authorName ?? '',
    authorAvatar: p.authorAvatar ?? '',
    category: p.category ?? '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    publishedDate: p.publishedDate ?? null,
    readTime: p.readTime ?? 5,
    views: p.views ?? 0,
    isPublished: p.isPublished ?? true,
});

export interface BlogsQuery {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    published?: string;
}

export const useBlogs = (params?: BlogsQuery) => {
    return useQuery({
        queryKey: queryKeys.blogs.list(params),
        queryFn: async () => {
            const res = await blogsApi.getAll(params);
            const mappedPosts = res.posts.map(mapBlogPost);
            return {
                posts: mappedPosts,
                pagination: res.pagination,
            };
        },
    });
};

export const useBlogDetail = (slug: string) => {
    return useQuery({
        queryKey: queryKeys.blogs.detail(slug),
        queryFn: async () => {
            const p = await blogsApi.getBySlug(slug);
            return mapBlogPost(p);
        },
        enabled: !!slug,
    });
};
