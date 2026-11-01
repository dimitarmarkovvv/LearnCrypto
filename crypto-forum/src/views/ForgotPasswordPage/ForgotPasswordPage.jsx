import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Button,
    Card,
    Container,
    Field,
    Heading,
    Input,
    Link,
    Stack,
    Text,
} from '@chakra-ui/react';
import { sendPasswordReset } from '../../services/auth';
import { toaster } from '../../components/ui/toast-store.js';
import { Header } from '../../components/ui/Header.jsx';
import './ForgotPasswordPage.css';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sentTo, setSentTo] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsLoading(true);

        try {
            const address = email.trim();

            await sendPasswordReset(address);

            setSentTo(address);
        } catch (error) {
            toaster.create({ title: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="forgot-password-page">
            <Header />

            <Card.Root className="forgot-password-page__card">
                <Card.Body>
                    {sentTo ? (
                        <Stack className="forgot-password-page__stack">
                            <Heading size="lg">Check your inbox</Heading>

                            <Text className="forgot-password-page__muted">
                                If an account exists for <strong>{sentTo}</strong>, we have
                                sent it a link to reset the password. The link expires
                                after a short while.
                            </Text>

                            <Link asChild>
                                <RouterLink to="/login">Back to login</RouterLink>
                            </Link>
                        </Stack>
                    ) : (
                        <>
                            <Heading size="lg" className="forgot-password-page__heading">Forgot password</Heading>

                            <Text className="forgot-password-page__intro">
                                Enter the email you signed up with and we will send you a
                                link to set a new password.
                            </Text>

                            <form onSubmit={handleSubmit}>
                                <Stack className="forgot-password-page__stack">
                                    <Field.Root required>
                                        <Field.Label>Email</Field.Label>

                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            required
                                        />
                                    </Field.Root>

                                    <Button
                                        type="submit"
                                        loading={isLoading}
                                        loadingText="Sending..."
                                    >
                                        Send reset link
                                    </Button>

                                    <Link asChild className="forgot-password-page__back">
                                        <RouterLink to="/login">Back to login</RouterLink>
                                    </Link>
                                </Stack>
                            </form>
                        </>
                    )}
                </Card.Body>
            </Card.Root>
        </Container>
    );
}

export default ForgotPasswordPage;
