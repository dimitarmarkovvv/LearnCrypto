import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import Comment from './Comment.jsx';

const rootComment = {
    id: 'comment-1',
    content: 'This is the root comment',
    author_id: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    profiles: { username: 'author' },
    replies: [],
};

const reply = {
    id: 'comment-2',
    content: 'This is a reply',
    author_id: 'user-2',
    created_at: '2026-01-02T00:00:00Z',
    profiles: { username: 'replier' },
    replies: [],
};

const renderComment = (props = {}) => {
    render(
        <ChakraProvider value={defaultSystem}>
            <MemoryRouter>
                <Comment
                    comment={rootComment}
                    userId="user-1"
                    isBlocked={false}
                    commentVotes={{}}
                    editingCommentId={null}
                    editCommentContent=""
                    setEditingCommentId={vi.fn()}
                    setEditCommentContent={vi.fn()}
                    handleEditComment={vi.fn()}
                    replyingTo={null}
                    replyContent=""
                    setReplyingTo={vi.fn()}
                    setReplyContent={vi.fn()}
                    handleComment={vi.fn()}
                    handleCommentVote={vi.fn()}
                    setCommentToDelete={vi.fn()}
                    {...props}
                />
            </MemoryRouter>
        </ChakraProvider>
    );
};

describe('Comment permissions', () => {
    it('offers Edit and Delete to the author of the comment', () => {
        renderComment({ userId: 'user-1' });

        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Delete' })
        ).toBeInTheDocument();
    });

    it('offers neither to a different user', () => {
        renderComment({ userId: 'someone-else' });

        expect(
            screen.queryByRole('button', { name: 'Edit' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Delete' })
        ).not.toBeInTheDocument();
    });

    it('offers both to an admin on a comment he did not write', () => {
        renderComment({ userId: 'admin-1', canModerate: true });

        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Delete' })
        ).toBeInTheDocument();
    });

    it('offers both to an admin on nested replies as well', () => {
        renderComment({
            comment: { ...rootComment, replies: [reply] },
            userId: 'admin-1',
            canModerate: true,
        });

        expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(
            2
        );
    });

    it('offers nothing on nested replies to a plain reader', () => {
        renderComment({
            comment: { ...rootComment, replies: [reply] },
            userId: 'someone-else',
        });

        expect(
            screen.queryByRole('button', { name: 'Edit' })
        ).not.toBeInTheDocument();
    });

    it('disables both for a blocked author on his own comment', () => {
        renderComment({ userId: 'user-1', isBlocked: true });

        expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    });
});