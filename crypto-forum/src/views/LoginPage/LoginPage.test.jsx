import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { LoginPage } from './LoginPage';
import { loginUser } from '../../services/auth.js';
import { toaster } from '../../components/ui/toast-store.js';

vi.mock('../../services/auth');
vi.mock('../../components/ui/toast-store.js');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderLoginPage = () => {
    render(
        <ChakraProvider value={defaultSystem}>
            <MemoryRouter initialEntries={['/login']}>
                <LoginPage />
            </MemoryRouter>
        </ChakraProvider>
    );
};

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders email and password fields', () => {
        renderLoginPage();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('calls loginUser and navigates on successful submit', async () => {
        loginUser.mockResolvedValue({});
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: /login/i }));

        expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('shows an error toast when login fails', async () => {
        loginUser.mockRejectedValue(new Error('Invalid credentials'));
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /login/i }));

        expect(toaster.create).toHaveBeenCalledWith({
            title: 'Invalid credentials',
            type: 'error',
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});