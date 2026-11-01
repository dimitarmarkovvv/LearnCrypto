import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Container, Field, Heading, Input, Stack } from '@chakra-ui/react';
import { registerUser } from '../../services/auth.js';
import { toaster } from '../../components/ui/toast-store.js';
import { Header } from '../../components/ui/Header.jsx';
import PasswordInput from '../../components/ui/PasswordInput.jsx';
import './RegisterPage.css';

export function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsLoading(true);

        try {
            await registerUser(email, password, { username, first_name: firstName, last_name: lastName });

            navigate('/');
        } catch (error) {
            toaster.create({ title: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        };
    };

    return (
        <Container className="register-page">
            <Header />

            <Card.Root className="register-page__card">
                <Card.Body>
                    <Heading size="lg" className="register-page__heading">Register</Heading>

                <form onSubmit={handleSubmit}>
                    <Stack className="register-page__form">
                        <Field.Root required>
                            <Field.Label>Username</Field.Label>
                            <Input
                                type='text'
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                required
                            />
                        </Field.Root>

                        <Field.Root required>
                            <Field.Label>First Name</Field.Label>
                            <Input
                                type='text'
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                required
                            />
                        </Field.Root>

                        <Field.Root required>
                            <Field.Label>Last Name</Field.Label>
                            <Input
                                type='text'
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                required
                            />
                        </Field.Root>

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

                        <Button type='submit' loading={isLoading} loadingText='Registering....'>
                            Register
                        </Button>
                    </Stack>
                </form>
                </Card.Body>
            </Card.Root>
        </Container>
    );
};
