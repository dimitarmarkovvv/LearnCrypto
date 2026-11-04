import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import EditProfilePage from './EditProfilePage.jsx';
import { updateProfile } from '../../services/profiles.js';
import { useAuth } from '../../hooks/useAuth.js';
import { toaster } from '../../components/ui/toast-store.js';
import {
    PROFILE_LOCATION_LENGTH_ERROR,
    PROFILE_NAME_LENGTH_ERROR,
} from '../../constants/constants.js';

vi.mock('../../services/profiles.js');
vi.mock('../../hooks/useAuth.js');
vi.mock('../../components/ui/toast-store.js', () => ({
    toaster: { create: vi.fn() },
}));

const renderPage = () => {
    render(
        <ChakraProvider value={defaultSystem}>
            <MemoryRouter>
                <EditProfilePage />
            </MemoryRouter>
        </ChakraProvider>
    );
};

const save = () =>
    userEvent.setup().click(screen.getByRole('button', { name: 'Save changes' }));

describe('EditProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        updateProfile.mockResolvedValue({});
        useAuth.mockReturnValue({
            user: { id: 'user-1' },
            profile: { first_name: 'Dimitar', last_name: 'Markov' },
            refreshProfile: vi.fn(),
        });
    });

    it('saves empty optional fields as null', async () => {
        renderPage();

        await save();

        expect(updateProfile).toHaveBeenCalledWith('user-1', {
            first_name: 'Dimitar',
            last_name: 'Markov',
            location: null,
            signature: null,
            gender: null,
        });
    });

    it('rejects a name that is too short once trimmed', async () => {
        renderPage();

        fireEvent.change(screen.getByLabelText(/First Name/), {
            target: { value: 'Ana  ' },
        });

        await save();

        expect(toaster.create).toHaveBeenCalledWith(
            expect.objectContaining({ title: PROFILE_NAME_LENGTH_ERROR })
        );
        expect(updateProfile).not.toHaveBeenCalled();
    });

    it('rejects a location that is too short once trimmed', async () => {
        renderPage();

        fireEvent.change(screen.getByLabelText('Location'), {
            target: { value: 'ab  ' },
        });

        await save();

        expect(toaster.create).toHaveBeenCalledWith(
            expect.objectContaining({ title: PROFILE_LOCATION_LENGTH_ERROR })
        );
        expect(updateProfile).not.toHaveBeenCalled();
    });
});
