import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import EditPostPage from './EditPostPage.jsx';
import { getPostById, updatePost } from '../../services/posts.js';
import { useAuth } from '../../hooks/useAuth.js';
import { toaster } from '../../components/ui/toast-store.js';

const navigate = vi.fn();

vi.mock('../../services/posts');
vi.mock('../../hooks/useAuth.js');
vi.mock('../../components/ui/toast-store.js', () => ({
    toaster: { create: vi.fn() },
}));
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();

    return {
        ...actual,
        useNavigate: () => navigate,
        useParams: () => ({ id: 'post-1' }),
    };
});

const VALID_TITLE = 'Is staking still worth it in 2026';
const VALID_CONTENT =
    'I have been staking for a while and I am no longer sure it makes sense.';

const ownPost = {
    id: 'post-1',
    title: 'The original title of the post',
    content: 'The original content of the post, long enough to be valid.',
    author_id: 'user-1',
};

const padded = (text, spaces) =>
    ' '.repeat(spaces) + text + ' '.repeat(spaces);

const renderPage = () => {
    render(
        <ChakraProvider value={defaultSystem}>
            <MemoryRouter initialEntries={['/posts/post-1/edit']}>
                <EditPostPage />
            </MemoryRouter>
        </ChakraProvider>
    );
};

const findFields = async () => {
    const fields = await screen.findAllByRole('textbox');

    return { title: fields[0], content: fields[1] };
};

describe('EditPostPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            user: { id: 'user-1' },
            profile: { is_blocked: false, role: 'user' },
        });
        getPostById.mockResolvedValue(ownPost);
    });

    it('loads the post into the form', async () => {
        renderPage();

        const { title, content } = await findFields();

        expect(title).toHaveValue(ownPost.title);
        expect(content).toHaveValue(ownPost.content);
    });

    it('connects the labels to their fields', async () => {
        renderPage();

        await findFields();

        expect(screen.getByLabelText(/Title/)).toHaveValue(ownPost.title);
        expect(screen.getByLabelText(/Content/)).toHaveValue(ownPost.content);
    });

    it('sends the author away from a post he did not write', async () => {
        getPostById.mockResolvedValue({
            ...ownPost,
            author_id: 'someone-else',
        });

        renderPage();

        await vi.waitFor(() => {
            expect(navigate).toHaveBeenCalledWith('/posts', { replace: true });
        });

        expect(toaster.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'You can only edit your own posts',
            })
        );
    });

    it('lets an admin edit a post written by somebody else', async () => {
        getPostById.mockResolvedValue({
            ...ownPost,
            author_id: 'someone-else',
        });
        useAuth.mockReturnValue({
            user: { id: 'admin-1' },
            profile: { is_blocked: false, role: 'admin' },
        });

        renderPage();

        const { title } = await findFields();

        expect(title).toHaveValue(ownPost.title);
        expect(navigate).not.toHaveBeenCalled();
    });

    it('sends a blocked moderator away from a post by somebody else', async () => {
        getPostById.mockResolvedValue({
            ...ownPost,
            author_id: 'someone-else',
        });
        useAuth.mockReturnValue({
            user: { id: 'moderator-1' },
            profile: { is_blocked: true, role: 'moderator' },
        });

        renderPage();

        await vi.waitFor(() => {
            expect(navigate).toHaveBeenCalledWith('/posts', { replace: true });
        });
    });

    it('saves the changes with trimmed values', async () => {
        updatePost.mockResolvedValue({ id: 'post-1' });

        const user = userEvent.setup();
        renderPage();

        const { title, content } = await findFields();

        fireEvent.change(title, { target: { value: padded(VALID_TITLE, 4) } });
        fireEvent.change(content, {
            target: { value: padded(VALID_CONTENT, 4) },
        });

        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(updatePost).toHaveBeenCalledWith('post-1', {
            title: VALID_TITLE,
            content: VALID_CONTENT,
        });
        expect(navigate).toHaveBeenCalledWith('/posts');
    });

    it('rejects a title that is only long enough because of whitespace', async () => {
        const user = userEvent.setup();
        renderPage();

        const { title } = await findFields();

        fireEvent.change(title, {
            target: { value: padded('short title', 10) },
        });

        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(updatePost).not.toHaveBeenCalled();
        expect(toaster.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Title must be between 16 and 64 characters.',
            })
        );
    });
});