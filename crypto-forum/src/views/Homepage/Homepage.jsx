import { useAuth } from '../../hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getForumStats, getMostCommentedPosts, getRecentPosts } from '../../services/homepage';
import { formatDate } from '../../utils/formatDate.js'
import { Box, Card, Center, Container, Flex, Grid, Heading, SimpleGrid, Spinner, Stack, Text, Link, List } from '@chakra-ui/react';
import { CryptoTicker } from '../../components/ui/CryptoTicker.jsx';
import { Header } from '../../components/ui/Header.jsx';
import { LuNewspaper, LuUsers, LuMessageSquare, LuChartNoAxesColumn } from 'react-icons/lu';
import './Homepage.css';

function StatRow({ icon, tone, label, value }) {
    return (
        <Flex className="home-page__stat">
            <Flex className="home-page__stat-label">
                <Box className={`home-page__stat-icon home-page__tone--${tone}`}>{icon}</Box>
                <Text className="home-page__muted">{label}</Text>
            </Flex>

            <Text className={`home-page__stat-value home-page__tone--${tone}`}>
                {value}
            </Text>
        </Flex>
    );
}

function HomePage() {
    const { loading } = useAuth();
    const [stats, setStats] = useState(null);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);


    useEffect(() => {
        const loadHomePageData = async () => {
            const statsData = await getForumStats();
            const postData = await getRecentPosts();
            const commentData = await getMostCommentedPosts();

            setPosts(postData);
            setStats(statsData);
            setComments(commentData);
        };

        loadHomePageData();
    }, []);

    if (loading) {
        return (
            <Center className="home-page__loading">
                <Spinner size='lg' />
            </Center>
        );
    };

    return (
        <Container className="home-page">
            <Header />

            <Grid className="home-page__top">
                {stats && (
                    <Card.Root as="section">
                        <Card.Header className="home-page__card-header">
                            <Flex className="home-page__card-header-row">
                                <Flex className="home-page__card-title-row">
                                    <Box className="home-page__brand-icon"><LuChartNoAxesColumn /></Box>
                                    <Heading size="sm" className="home-page__card-title">
                                        Live statistics
                                    </Heading>
                                </Flex>
                            </Flex>
                        </Card.Header>

                        <Card.Body>
                            <Stack className="home-page__stats">
                                <StatRow
                                    icon={<LuUsers />}
                                    tone="blue"
                                    label="Users"
                                    value={stats.totalUsers}
                                />
                                <StatRow
                                    icon={<LuNewspaper />}
                                    tone="green"
                                    label="Posts"
                                    value={stats.totalPosts}
                                />
                                <StatRow
                                    icon={<LuMessageSquare />}
                                    tone="purple"
                                    label="Comments"
                                    value={stats.totalComments}
                                />
                            </Stack>
                        </Card.Body>
                    </Card.Root>
                )}

                <Card.Root as="section">
                    <Card.Body>
                        <Stack className="home-page__about">
                            <Text className="home-page__muted">LearnCrypto is a community for discussing cryptocurrency news, trading strategies, and blockchain technology.</Text>

                            <Box>
                                <Text className="home-page__about-title">What you can do here:</Text>

                                <List.Root className="home-page__about-list home-page__muted">
                                    <List.Item>Follow and discuss the latest crypto news</List.Item>
                                    <List.Item>Share trading strategies and get honest feedback</List.Item>
                                    <List.Item>Learn how blockchain technology works</List.Item>
                                    <List.Item>Vote on the posts you find most useful</List.Item>
                                </List.Root>
                            </Box>

                            <Text className="home-page__muted home-page__about-note">Posts reflect the views of their authors and are not financial advice.</Text>
                        </Stack>
                    </Card.Body>
                </Card.Root>
            </Grid>

            <CryptoTicker />

            <SimpleGrid className="home-page__lists">
                <Card.Root as="section">
                    <Card.Header>
                        <Heading size="lg">Recent Posts</Heading>
                    </Card.Header>
                    <Card.Body>
                        <Stack className="home-page__list">
                            {posts.map((post) => (
                                <Box key={post.id}>
                                    <Heading size="md" asChild>
                                    <RouterLink to={`/posts/${post.id}`}>{post.title}</RouterLink>
                                    </Heading>
                                    <Text className="home-page__muted"> by {' '}
                                    <Link asChild>
                                    <RouterLink to={`/users/${post.author_id}`}>{post.author}</RouterLink>
                                    </Link>
                                    {' - '} {formatDate(post.created_at)}</Text>
                                </Box>
                            ))}
                        </Stack>
                    </Card.Body>
                </Card.Root>

                <Card.Root as="section">
                    <Card.Header>
                        <Heading size="lg">Most commented posts</Heading>
                    </Card.Header>
                    <Card.Body>
                        <Stack className="home-page__list">
                            {comments.map((comment) => (
                                <Box key={comment.id}>
                                    <Heading size="md" asChild>
                                    <RouterLink to={`/posts/${comment.id}`}>{comment.title}</RouterLink>
                                    </Heading>
                                    <Text className="home-page__muted"> by {' '}
                                        <Link asChild>
                                        <RouterLink to={`/users/${comment.author_id}`}>{comment.author}</RouterLink>
                                        </Link>
                                        {' - '} {formatDate(comment.created_at)}</Text>
                                </Box>
                            ))}
                        </Stack>
                    </Card.Body>
                </Card.Root>
            </SimpleGrid>
        </Container>
    );
};

export default HomePage;
