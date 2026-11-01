import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import PostDetailsPage from './PostDetailsPage.jsx';
import { getPostById } from '../../services/posts.js';
import { getCommentsByPostId, createComment } from '../../services/comments.js';
import { getPostVotes, castVote, getCommentVotes, castCommentVote } from '../../services/votes.js';
import { useAuth } from '../../hooks/useAuth.js';

vi.mock('../../services/posts');
vi.mock('../../services/comments');
vi.mock('../../services/votes');
vi.mock('../../hooks/useAuth.js');
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useParams: () => ({ id: 'post-1' }),
    };
});

const mockPost = {
    id: 'post-1',
    title: 'Test Post Title',
    content: 'Test post content here.',
    author_id: 'author-1',
    created_at: '2026-01-01T00:00:00Z',
    profiles: { username: 'postauthor' },
};

const renderPage = () => {
    render(
        <ChakraProvider value={defaultSystem}>
            <MemoryRouter>
                <PostDetailsPage />
            </MemoryRouter>
        </ChakraProvider>
    );
};

describe('PostDetailsPage - comments and voting', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ user: { id: 'user-1' }, profile: { is_blocked: false } });
        getPostById.mockResolvedValue(mockPost);
        getCommentsByPostId.mockResolvedValue([]);
        getPostVotes.mockResolvedValue({ score: 0, userVote: 0 });
        getCommentVotes.mockResolvedValue({});
    });

    it('posts a new comment and displays it', async () => {
        const newComment = {
            id: 'comment-1',
            content: 'Great post!',
            author_id: 'user-1',
            parent_comment_id: null,
            created_at: '2026-01-02T00:00:00Z',
            profiles: { username: 'testuser' },
        };
        createComment.mockResolvedValue(newComment);

        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Test Post Title');

        await user.type(screen.getByPlaceholderText('Write a comment...'), 'Great post!');
        await user.click(screen.getByRole('button', { name: 'Post Comment' }));

        expect(createComment).toHaveBeenCalledWith('Great post!', 'post-1', 'user-1', null);
        expect(await screen.findByText('Great post!')).toBeInTheDocument();
    });

    it('upvotes the post', async () => {
        castVote.mockResolvedValue(null);
        getPostVotes
            .mockResolvedValueOnce({ score: 0, userVote: 0 })
            .mockResolvedValueOnce({ score: 1, userVote: 1 });

        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Test Post Title');

        await user.click(screen.getByText('▲'));

        expect(castVote).toHaveBeenCalledWith('post-1', 'user-1', 1);
        expect(await screen.findByText('1')).toBeInTheDocument();
    });

    it('upvotes a comment', async () => {
        const existingComment = {
            id: 'comment-1',
            content: 'Existing comment',
            author_id: 'other-user',
            parent_comment_id: null,
            created_at: '2026-01-01T12:00:00Z',
            profiles: { username: 'otheruser' },
        };
        getCommentsByPostId.mockResolvedValue([existingComment]);
        getCommentVotes
            .mockResolvedValueOnce({ 'comment-1': { score: 0, userVote: 0 } })
            .mockResolvedValueOnce({ 'comment-1': { score: 1, userVote: 1 } });
        castCommentVote.mockResolvedValue(null);

        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Existing comment');

        const upvoteButtons = screen.getAllByText('▲');
        await user.click(upvoteButtons[1]);

        expect(castCommentVote).toHaveBeenCalledWith('comment-1', 'user-1', 1);
    });
});