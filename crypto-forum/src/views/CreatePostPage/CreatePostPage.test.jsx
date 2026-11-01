import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import CreatePostPage from './CreatePostPage';
import { createPost } from '../../services/posts.js';
import { useAuth } from '../../hooks/useAuth.js';
import { toaster } from '../../components/ui/toast-store.js';

const navigate = vi.fn();

vi.mock('../../services/posts');
vi.mock('../../hooks/useAuth');
vi.mock('../../components/ui/toast-store.js', () => ({
    toaster: { create: vi.fn() },
}));
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();

    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

const VALID_TITLE = 'Is staking still worth it in 2026';
const VALID_CONTENT =
    'I have been staking for a while and I am no longer sure it makes sense.';

const padded = (text, spaces) =>
    ' '.repeat(spaces) + text + ' '.repeat(spaces);

const renderPage = () => {
    render(
        <ChakraProvider value={defaultSystem}>
            <MemoryRouter initialEntries={['/posts/create']}>
                <CreatePostPage />
            </MemoryRouter>
        </ChakraProvider>
    );
};

const fillForm = (title, content) => {
    fireEvent.change(
        screen.getByPlaceholderText(
            'Ask something the forum can actually answer'
        ),
        { target: { value: title } }
    );

    fireEvent.change(
        screen.getByPlaceholderText(/Give some context/),
        { target: { value: content } }
    );
};

describe('CreatePostPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            user: { id: 'user-1' },
            profile: { is_blocked: false },
        });
    });

    it('rejects a title that is only long enough because of whitespace', async () => {
        const user = userEvent.setup();
        renderPage();

        fillForm(padded('short title', 10), VALID_CONTENT);

        await user.click(screen.getByRole('button', { name: 'Create Post' }));

        expect(createPost).not.toHaveBeenCalled();
        expect(toaster.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Title must be between 16 and 64 characters.',
            })
        );
    });

    it('rejects content that is only long enough because of whitespace', async () => {
        const user = userEvent.setup();
        renderPage();

        fillForm(VALID_TITLE, padded('short content', 15));

        await user.click(screen.getByRole('button', { name: 'Create Post' }));

        expect(createPost).not.toHaveBeenCalled();
        expect(toaster.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Content must be between 32 and 8192 characters.',
            })
        );
    });

    it('creates the post with trimmed values and leaves the form', async () => {
        createPost.mockResolvedValue({ id: 'post-1' });

        const user = userEvent.setup();
        renderPage();

        fillForm(padded(VALID_TITLE, 4), padded(VALID_CONTENT, 4));

        await user.click(screen.getByRole('button', { name: 'Create Post' }));

        expect(createPost).toHaveBeenCalledWith(
            { title: VALID_TITLE, content: VALID_CONTENT },
            'user-1'
        );
        expect(navigate).toHaveBeenCalledWith('/posts');
    });

    it('counts how many characters the title still needs', async () => {
        renderPage();

        fillForm('Short', '');

        expect(
            await screen.findByText('11 more characters needed')
        ).toBeInTheDocument();

        fillForm(VALID_TITLE, '');

        expect(await screen.findByText('Looks good')).toBeInTheDocument();
    });

    it('does not render the form for a blocked user', () => {
        useAuth.mockReturnValue({
            user: { id: 'user-1' },
            profile: { is_blocked: true },
        });

        renderPage();

        expect(
            screen.getByText('You cannot Create posts')
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Create Post' })
        ).not.toBeInTheDocument();
    });
});