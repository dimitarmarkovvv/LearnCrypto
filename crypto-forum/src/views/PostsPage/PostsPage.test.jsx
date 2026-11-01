import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import PostsPage from './PostsPage';
import { getPosts } from '../../services/posts';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../services/posts');
vi.mock('../../hooks/useAuth');
vi.mock('../../components/ui/toast-store.js', () => ({
    toaster: { create: vi.fn() },
}));

const somebodyElsesPost = {
    id: 'post-1',
    title: 'A post written by somebody else',
    content: 'Some content for the card.',
    author_id: 'user-2',
    created_at: '2026-01-01T00:00:00Z',
    profiles: { username: 'author' },
    commentCount: 0,
};

const renderPage = () => {
    render(
        <ChakraProvider value={defaultSystem}>
            <MemoryRouter initialEntries={['/posts']}>
                <PostsPage />
            </MemoryRouter>
        </ChakraProvider>
    );
};

describe('PostsPage permissions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getPosts.mockResolvedValue([somebodyElsesPost]);
    });

    it('offers Edit and Delete to the author of the post', async () => {
        useAuth.mockReturnValue({
            user: { id: 'user-2' },
            profile: { is_blocked: false, role: 'user' },
        });

        renderPage();

        expect(
            await screen.findByRole('button', { name: /Edit/ })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Delete/ })
        ).toBeInTheDocument();
    });

    it('offers neither to a different user', async () => {
        useAuth.mockReturnValue({
            user: { id: 'user-1' },
            profile: { is_blocked: false, role: 'user' },
        });

        renderPage();

        expect(
            await screen.findByText(somebodyElsesPost.title)
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /Edit/ })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /Delete/ })
        ).not.toBeInTheDocument();
    });

    it('offers both to an admin on a post he did not write', async () => {
        useAuth.mockReturnValue({
            user: { id: 'admin-1' },
            profile: { is_blocked: false, role: 'admin' },
        });

        renderPage();

        expect(
            await screen.findByRole('button', { name: /Edit/ })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Delete/ })
        ).toBeInTheDocument();
    });
});
