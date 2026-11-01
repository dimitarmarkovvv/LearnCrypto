import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Button,
    Card,
    Container,
    Field,
    Heading,
    Link,
    Stack,
    Text,
} from '@chakra-ui/react';
import { supabase } from '../../supabase/supabaseClient';
import { updatePassword } from '../../services/auth';
import { toaster } from '../../components/ui/toast-store.js';
import PasswordInput from '../../components/ui/PasswordInput.jsx';
import './ResetPasswordPage.css';

const MIN_LENGTH = 6;

const readTokensFromUrl = () => {
    const hash = window.location.hash.replace(/^#/, '');

    if (!hash) {
        return null;
    }

    const params = new URLSearchParams(hash);

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
        return null;
    }

    return { accessToken, refreshToken };
};

export function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tokens] = useState(readTokensFromUrl);

    const navigate = useNavigate();

    useEffect(() => {
        window.history.replaceState(null, '', window.location.pathname);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password !== confirm) {
            toaster.create({ title: 'The passwords do not match', type: 'error' });

            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.setSession({
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
            });

            if (error) {
                throw error;
            }

            await updatePassword(password);
            await supabase.auth.signOut({ scope: 'global' });

            toaster.create({
                title: 'Password updated',
                description: 'Log in with your new password.',
                type: 'success',
            });

            navigate('/login');
        } catch (error) {
            toaster.create({ title: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="reset-password-page">
            <Card.Root className="reset-password-page__card">
                <Card.Body>
                    <Heading size="lg" className="reset-password-page__heading">Set a new password</Heading>

                    {tokens === null ? (
                        <Stack className="reset-password-page__stack">
                            <Text className="reset-password-page__muted">
                                This link is invalid or has expired. Request a new one and
                                open it in this browser.
                            </Text>

                            <Link asChild>
                                <RouterLink to="/forgot-password">
                                    Request a new link
                                </RouterLink>
                            </Link>
                        </Stack>
                    ) : (
                        <>
                            <Text className="reset-password-page__intro">
                                Choose a password of at least {MIN_LENGTH} characters.
                                You will be asked to log in with it afterwards.
                            </Text>

                            <form onSubmit={handleSubmit}>
                                <Stack className="reset-password-page__stack">
                                    <Field.Root required>
                                        <Field.Label>New password</Field.Label>

                                        <PasswordInput
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            minLength={MIN_LENGTH}
                                            required
                                        />
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label>Confirm password</Field.Label>

                                        <PasswordInput
                                            value={confirm}
                                            onChange={(event) => setConfirm(event.target.value)}
                                            minLength={MIN_LENGTH}
                                            required
                                        />

                                        {confirm.length > 0 && confirm !== password && (
                                            <Field.HelperText className="reset-password-page__error">
                                                The passwords do not match
                                            </Field.HelperText>
                                        )}
                                    </Field.Root>

                                    <Button
                                        type="submit"
                                        loading={isLoading}
                                        loadingText="Saving..."
                                        disabled={!tokens}
                                    >
                                        Save new password
                                    </Button>
                                </Stack>
                            </form>
                        </>
                    )}
                </Card.Body>
            </Card.Root>
        </Container>
    );
}

export default ResetPasswordPage;
