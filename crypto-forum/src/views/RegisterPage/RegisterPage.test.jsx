import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { RegisterPage } from './RegisterPage.jsx';
import { registerUser } from '../../services/auth.js';
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

const renderRegisterPage = () => {
    render(
        <ChakraProvider value={defaultSystem}>
            <MemoryRouter initialEntries={['/register']}>
                <RegisterPage />
            </MemoryRouter>
        </ChakraProvider>
    );
};

describe('RegisterPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders email and password fields', () => {
        renderRegisterPage();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('calls registerUser and navigates on successful submit', async () => {
    registerUser.mockResolvedValue({});
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('First Name'), 'Test');
    await user.type(screen.getByLabelText('Last Name'), 'User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(registerUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        { username: 'testuser', first_name: 'Test', last_name: 'User' }
    );
    expect(mockNavigate).toHaveBeenCalledWith('/');
});

    it('shows an error toast when register fails', async () => {
        registerUser.mockRejectedValue(new Error('Invalid credentials'));
        const user = userEvent.setup();
        renderRegisterPage();

        await user.type(screen.getByLabelText('Username'), 'testuser');
        await user.type(screen.getByLabelText('First Name'), 'Test');
        await user.type(screen.getByLabelText('Last Name'), 'User');
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: /register/i }));

        expect(toaster.create).toHaveBeenCalledWith({
            title: 'Invalid credentials',
            type: 'error',
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});