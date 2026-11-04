import { useEffect, useState } from "react";
import { deletePost, getPosts } from "../../services/posts.js";
import { formatDate } from "../../utils/formatDate.js";
import { useAuth } from '../../hooks/useAuth.js';
import { canModerate } from '../../utils/roles.js';
import { getAvatarUrl } from '../../services/profiles.js';
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    Center,
    Container,
    Flex,
    Heading,
    HStack,
    Input,
    Link,
    NativeSelect,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import { toaster } from '../../components/ui/toast-store.js';
import { Header } from '../../components/ui/Header.jsx';
import { LuPencil, LuTrash2 } from 'react-icons/lu';
import DeletePostDialog from '../../components/ui/DeletePostDialog.jsx';
import './PostsPage.css';

function PostsPage() {
    const { user, profile } = useAuth();
    const isModerator = canModerate(profile);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);

    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [filter, setFilter] = useState('all');
    const [postToDelete, setPostToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const pageSize = 10;

    const handleDelete = async () => {
        setDeleting(true);

        try {
            await deletePost(postToDelete);

            setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postToDelete));
        } catch (error) {
            toaster.create({ title: error.message, type: 'error' });
        } finally {
            setDeleting(false);
            setPostToDelete(null);
        };
    };

    useEffect(() => {
        const loadPosts = async () => {
            setLoading(true)

            try {
                const postsData = await getPosts({
                    page: currentPage,
                    pageSize,
                    search,
                    sort,
                    authorID: filter === 'mine' ? user.id : null,
                });

                setPosts(postsData);
            } catch (error) {
                toaster.create({ title: error.message, type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        loadPosts();

    }, [currentPage, search, sort, filter, user.id]);


    return (
        <Container className="posts-page">
            <Header />

            <HStack className="posts-page__header">
                <Heading>Posts</Heading>

                <Button
                    onClick={() => navigate('/posts/create')}
                    disabled={profile?.is_blocked}
                >
                    Create Post
                </Button>
            </HStack>

            <HStack className="posts-page__filters">
                <Input
                    type="text"
                    placeholder="Search posts..."
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value)
                        setCurrentPage(1)
                    }}
                    className="posts-page__search"
                />

                <NativeSelect.Root className="posts-page__select">
                    <NativeSelect.Field
                        value={sort}
                        onChange={(event) => {
                            setSort(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                </NativeSelect.Root>

                <NativeSelect.Root className="posts-page__select">
                    <NativeSelect.Field
                        value={filter}
                        onChange={(event) => {
                            setFilter(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">All Posts</option>
                        <option value="mine">My posts</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                </NativeSelect.Root>
            </HStack>

            {loading ? (
                <Center className="posts-page__loading">
                    <Spinner size="lg" />
                </Center>
            ) : posts.length === 0 ? (
                <Text>No posts available.</Text>
            ) : (
                <Stack className="posts-page__list">
                    {posts.map((post) => (
                        <Box key={post.id} as="article" className="posts-page__post">
                            <Heading size="md" asChild>
                                <RouterLink to={`/posts/${post.id}`}>{post.title}</RouterLink>
                            </Heading>

                            <Text className="posts-page__content">{post.content}</Text>

                            <Flex className="posts-page__meta">
                                <Link asChild>
                                    <RouterLink to={`/users/${post.author_id}`}>
                                        <Avatar.Root
                                            size="sm"
                                            className="posts-page__avatar"
                                        >
                                            <Avatar.Fallback
                                                name={post.profiles.username}
                                            />

                                            {post.profiles.avatar_url && (
                                                <Avatar.Image
                                                    src={getAvatarUrl(
                                                        post.profiles.avatar_url
                                                    )}
                                                    alt={`${post.profiles.username}'s avatar`}
                                                />
                                            )}
                                        </Avatar.Root>
                                    </RouterLink>
                                </Link>

                                <Text className="posts-page__byline">
                                    by{' '}
                                    <Link asChild>
                                        <RouterLink to={`/users/${post.author_id}`}>
                                            {post.profiles.username}
                                        </RouterLink>
                                    </Link>
                                    {' - '}
                                    {formatDate(post.created_at)}
                                </Text>
                            </Flex>
                            <Text className="posts-page__comment-count">
                                {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                            </Text>

                            {(post.author_id === user.id || isModerator) && (
                                <HStack className="posts-page__actions">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={profile?.is_blocked}
                                        onClick={() => navigate(`/posts/${post.id}/edit`)}
                                    >
                                        <LuPencil /> Edit
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        colorPalette="red"
                                        disabled={profile?.is_blocked}
                                        onClick={() => setPostToDelete(post.id)}
                                    >
                                        <LuTrash2 /> Delete
                                    </Button>
                                </HStack>
                            )}
                        </Box>
                    ))}
                </Stack>
            )}

            <DeletePostDialog
                open={postToDelete !== null}
                setOpen={() => setPostToDelete(null)}
                handleDeletePost={handleDelete}
                loading={deleting}
            />
        </Container>
    )
}

export default PostsPage;
