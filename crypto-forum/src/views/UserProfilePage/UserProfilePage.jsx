import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { LuMapPin, LuUser, LuPencil, LuNewspaper, LuMessageSquare } from 'react-icons/lu';
import {
    Card, Center, Container, Flex, Heading, Avatar, Spinner, Stack, Text, Box, Grid, Button, Link
} from '@chakra-ui/react';
import { getAvatarUrl, getUserProfileById } from '../../services/profiles';
import { getPosts } from '../../services/posts.js';
import { formatDate } from '../../utils/formatDate.js';
import { getCommentsByAuthorId } from '../../services/comments.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Header } from '../../components/ui/Header.jsx';
import { PROFILE_POSTS_LIMIT } from '../../constants/constants.js';
import './UserProfilePage.css';

function MetaRow({ icon, text }) {
    return (
        <Flex className="user-profile-page__meta-row">
            <Box>{icon}</Box>
            <Text className="user-profile-page__meta-text">{text}</Text>
        </Flex>
    );
}

function SectionTitle({ icon, title, count }) {
    return (
        <Flex className="user-profile-page__section-title-row">
            <Box className="user-profile-page__icon">{icon}</Box>

            <Heading size="sm" className="user-profile-page__section-title">
                {title}
            </Heading>

            <Text className="user-profile-page__count">({count})</Text>
        </Flex>
    );
}

function UserProfilePage() {
    const { id } = useParams();
    const { user} = useAuth();

    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError('');

                const profile = await getUserProfileById(id);
                if (!profile) {
                    setUserProfile(null);
                    return;
                }
                setUserProfile(profile)

                const userPosts = await getPosts({
                    authorID: id,
                    pageSize: PROFILE_POSTS_LIMIT,
                });

                setPosts(userPosts);

                const userComments = await getCommentsByAuthorId(id);
                setComments(userComments);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false)
            }
        };

        loadProfile()
    }, [id])

    if (loading) {
        return (
            <Center className="user-profile-page__loading">
                <Spinner size="lg" />
            </Center>
        );
    }

    if (error) {
        return (
            <Container className="user-profile-page__error-container">
                <Text className="user-profile-page__error">
                    Failed to load profile: {error}
                </Text>
            </Container>
        )
    }

    if (!userProfile) {
        return (
            <Center className="user-profile-page__not-found">
                <Stack className="user-profile-page__not-found-stack">
                    <Heading size="2xl">
                        User not found.
                    </Heading>

                    <Text className="user-profile-page__not-found-text">
                        The user you are looking for does not exist.
                    </Text> 

                    <Button
                        size="lg"
                        onClick={() => navigate('/')}
                    >
                        Go to Home
                    </Button>
                </Stack>
            </Center>
        )
    }

    return (
        <Container className="user-profile-page">
            <Header />

            <Grid className="user-profile-page__layout">
                <Card.Root as="aside">
                    <Card.Body>
                        <Stack className="user-profile-page__summary">
                            <Avatar.Root className="user-profile-page__avatar">
                                <Avatar.Fallback
                                    name={`${userProfile.first_name} ${userProfile.last_name}`}
                                />

                                {userProfile.avatar_url && (
                                    <Avatar.Image
                                        src={getAvatarUrl(userProfile.avatar_url)}
                                        alt={`${userProfile.username}'s avatar`}
                                    />
                                )}
                            </Avatar.Root>

                            <Stack className="user-profile-page__names">
                                <Heading size="lg">{userProfile.username}</Heading>

                                <Text className="user-profile-page__muted">
                                    {userProfile.first_name} {userProfile.last_name}
                                </Text>
                            </Stack>

                            {(userProfile.location || userProfile.gender) && (
                                <Stack className="user-profile-page__meta">
                                    {userProfile.location && (
                                        <MetaRow icon={<LuMapPin />} text={userProfile.location} />
                                    )}

                                    {userProfile.gender && (
                                        <MetaRow icon={<LuUser />} text={userProfile.gender} />
                                    )}
                                </Stack>
                            )}

                            {userProfile.signature && (
                                <Text className="user-profile-page__signature">
                                    &ldquo;{userProfile.signature}&rdquo;
                                </Text>
                            )}

                            {user.id === userProfile.id && (
                                <Button
                                    size="sm"
                                    className="user-profile-page__edit"
                                    onClick={() => navigate('/profile/edit')}
                                >
                                    <LuPencil /> Edit Profile
                                </Button>
                            )}
                        </Stack>
                    </Card.Body>
                </Card.Root>

                <Stack className="user-profile-page__sections">
                    <Card.Root as="section">
                        <Card.Header className="user-profile-page__section-header">
                            <SectionTitle
                                icon={<LuNewspaper />}
                                title="Posts"
                                count={posts.length}
                            />
                        </Card.Header>

                        <Card.Body>
                            {posts.length === 0 ? (
                                <Text className="user-profile-page__muted">
                                    This user has not created any posts yet.
                                </Text>
                            ) : (
                                <Stack className="user-profile-page__items">
                                    {posts.map((post) => (
                                        <Box
                                            key={post.id}
                                            className="user-profile-page__item"
                                        >
                                            <Heading size="sm" asChild>
                                                <RouterLink to={`/posts/${post.id}`}>
                                                    {post.title}
                                                </RouterLink>
                                            </Heading>

                                            <Text className="user-profile-page__excerpt">
                                                {post.content}
                                            </Text>

                                            <Text className="user-profile-page__item-meta">
                                                {formatDate(post.created_at)}
                                            </Text>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Card.Body>
                    </Card.Root>

                    <Card.Root as="section">
                        <Card.Header className="user-profile-page__section-header">
                            <SectionTitle
                                icon={<LuMessageSquare />}
                                title="Comments"
                                count={comments.length}
                            />
                        </Card.Header>

                        <Card.Body>
                            {comments.length === 0 ? (
                                <Text className="user-profile-page__muted">
                                    This user has not created any comments yet.
                                </Text>
                            ) : (
                                <Stack className="user-profile-page__items">
                                    {comments.map((comment) => (
                                        <Box
                                            key={comment.id}
                                            className="user-profile-page__item"
                                        >
                                            <Text>{comment.content}</Text>

                                            <Text className="user-profile-page__item-meta">
                                                on{' '}
                                                <Link asChild className="user-profile-page__inherit-link">
                                                    <RouterLink to={`/posts/${comment.posts.id}`}>
                                                        {comment.posts.title}
                                                    </RouterLink>
                                                </Link>
                                                {' · '}
                                                {formatDate(comment.created_at)}
                                            </Text>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Card.Body>
                    </Card.Root>
                </Stack>
            </Grid>
        </Container>
    );
}

export default UserProfilePage;
