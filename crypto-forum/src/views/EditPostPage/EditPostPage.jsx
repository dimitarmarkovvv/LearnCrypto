import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getPostById, updatePost } from "../../services/posts.js";
import { useEffect, useState } from "react";
import { Button, Center, Container, Field, Heading, Input, Spinner, Stack, Textarea, Box, Text } from '@chakra-ui/react';
import { toaster } from '../../components/ui/toast-store.js';
import { useAuth } from "../../hooks/useAuth.js";
import { canModerate } from "../../utils/roles.js";
import { Header } from '../../components/ui/Header.jsx';
import './EditPostPage.css';

function EditPostPage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const [pageLoading, setPageLoading] = useState(true);
    const { user, profile } = useAuth();
    const isModerator = canModerate(profile);

    useEffect(() => {
        const loadPost = async () => {
            setPageLoading(true);

            try {
                const post = await getPostById(id);

                if (post.author_id !== user.id && !isModerator) {
                    toaster.create({
                        id: 'unauthorized-edit-post',
                        title: 'You can only edit your own posts',
                        type: 'error',
                    });

                    navigate('/posts', { replace: true })
                    return;
                }

                setTitle(post.title);
                setContent(post.content);
            } catch (e) {
                toaster.create({ title: e.message, type: 'error' });
            } finally {
                setPageLoading(false);
            }
        };

        loadPost();
    }, [id, user.id, isModerator, profile?.is_blocked, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (trimmedTitle.length < 16 || trimmedTitle.length > 64) {
            toaster.create({ title: 'Title must be between 16 and 64 characters.', type: 'error' });
            return;
        }

        if (trimmedContent.length < 32 || trimmedContent.length > 8192) {
            toaster.create({ title: 'Content must be between 32 and 8192 characters.', type: 'error' });
            return;
        }

        try {
            setLoading(true)

            await updatePost(
                id,
                {
                    title: trimmedTitle,
                    content: trimmedContent,
                },
            )

            navigate('/posts');
        } catch (error) {
            toaster.create({ title: error.message, type: 'error' })
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <Center className="edit-post-page__loading">
                <Spinner size="lg" />
            </Center>
        );
    }

    if (profile?.is_blocked) {
        return (
            <Container className="edit-post-page edit-post-page--narrow">
                <Box className="edit-post-page__notice">
                    <Text className="edit-post-page__notice-title">
                        Editing disabled
                    </Text>

                    <Text className="edit-post-page__notice-text">
                        You cannot edit posts while your account is blocked.
                    </Text>
                </Box>

                <Button
                    className="edit-post-page__back"
                    onClick={() => navigate('/posts')}
                >
                    Back to Posts
                </Button>
            </Container>
        );
    }

    return (
        <Container className="edit-post-page">
            <Header />

            <Heading className="edit-post-page__heading">Edit Post</Heading>

            <form onSubmit={handleSubmit}>
                <Stack className="edit-post-page__form">
                    <Field.Root required>
                        <Field.Label>Title</Field.Label>
                        <Input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            minLength={16}
                            maxLength={64}
                            required
                        />
                    </Field.Root>

                    <Field.Root required>
                        <Field.Label>Content</Field.Label>

                        <Textarea
                            id="content"
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            minLength={32}
                            maxLength={8192}
                            rows={14}
                            className="edit-post-page__content"
                            required
                        />
                    </Field.Root>

                    <Stack className="edit-post-page__actions">
                        <Button type="submit" loading={loading} loadingText="Saving...">
                            Save changes
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            disabled={loading}
                            onClick={() => navigate(`/posts/${id}`)}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </form>
        </Container>
    )
};

export default EditPostPage;
