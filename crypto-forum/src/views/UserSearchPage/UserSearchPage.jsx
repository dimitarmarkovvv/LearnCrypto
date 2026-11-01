import { useEffect, useState } from 'react';
import { Box, Container, Heading, HStack, Input, Spinner, Stack, Text } from '@chakra-ui/react';
import { toaster } from '../../components/ui/toast-store.js';
import { searchUsers, getAvatarUrl } from '../../services/profiles.js';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/ui/Header.jsx';
import './UserSearchPage.css';

function UserSearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!searchTerm.trim()) {
            return;
        }

        const search = async () => {
            setLoading(true);
            try {
                const data = await searchUsers(searchTerm);
                setResults(data);
            } catch (error) {
                toaster.create({ title: error.message, type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        search();
    }, [searchTerm]);


    return (
        <Container className="user-search-page">
            <Header />

            <Heading className="user-search-page__heading">Search Users</Heading>

            <Input
                placeholder="Search by username or name..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="user-search-page__input"
            />

            {!searchTerm.trim() ? (
                <Text>Type something to search.</Text>
            ) : loading ? (
                <Spinner />
            ) : (
                <Stack className="user-search-page__results">
                    {results.map((foundUser) => (
                        <HStack
                            key={foundUser.id}
                            className="user-search-page__result"
                            onClick={() => navigate(`/users/${foundUser.id}`)}
                        >
                            {foundUser.avatar_url && (
                                <img src={getAvatarUrl(foundUser.avatar_url)} alt="avatar" width={40} height={40} className="user-search-page__avatar" />
                            )}
                            <Box>
                                <Text className="user-search-page__username">
                                    {foundUser.username}
                                </Text>
                                <Text className="user-search-page__name">
                                    {foundUser.first_name} {foundUser.last_name}
                                </Text>
                            </Box>
                        </HStack>
                    ))}
                </Stack>
            )}
        </Container>
    );
};

export default UserSearchPage;
