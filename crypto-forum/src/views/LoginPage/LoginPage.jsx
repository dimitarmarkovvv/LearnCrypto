import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Button, Card, Container, Field, Heading, Input, Link, Stack } from '@chakra-ui/react';
import { loginUser } from '../../services/auth.js';
import { toaster } from '../../components/ui/toast-store.js';
import { Header } from '../../components/ui/Header.jsx';
import PasswordInput from '../../components/ui/PasswordInput.jsx';
import './LoginPage.css';

export function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (event) => {
        event.preventDefault()

        setIsLoading(true)

        try {
            await loginUser(email, password)

            navigate(from, { replace: true })
        } catch (error) {
            toaster.create({ title: error.message, type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <Container className="login-page">
            <Header />

            <Card.Root className="login-page__card">
                <Card.Body>
                    <Heading size="lg" className="login-page__heading">Login</Heading>

                <form onSubmit={handleSubmit}>
                    <Stack className="login-page__form">
                        <Field.Root required>
                            <Field.Label>Email</Field.Label>
                            <Input
                                type='email'
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </Field.Root>

                        <Field.Root required>
                            <Field.Label>Password</Field.Label>
                            <PasswordInput
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </Field.Root>

                        <Link asChild className="login-page__forgot">
                            <RouterLink to="/forgot-password">
                                Forgot password?
                            </RouterLink>
                        </Link>

                        <Button type='submit' loading={isLoading} loadingText='Logging in...'>
                            Login
                        </Button>
                    </Stack>
                </form>
                </Card.Body>
            </Card.Root>
        </Container>
    )
}
