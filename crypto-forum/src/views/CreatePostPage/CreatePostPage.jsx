import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useState } from 'react';
import { createPost } from '../../services/posts.js';
import { Alert, Box, Button, Card, Container, Field, Flex, Heading, Input, Stack, Text, Textarea } from '@chakra-ui/react';
import { toaster } from '../../components/ui/toast-store.js';
import { Header } from '../../components/ui/Header.jsx';
import { LuPenLine } from 'react-icons/lu';
import {
    POST_CONTENT_LENGTH_ERROR,
    POST_CONTENT_MAX_LENGTH,
    POST_CONTENT_MIN_LENGTH,
    POST_CONTENT_ROWS,
    POST_TITLE_LENGTH_ERROR,
    POST_TITLE_MAX_LENGTH,
    POST_TITLE_MIN_LENGTH,
} from '../../constants/constants.js';
import './CreatePostPage.css';

function CreatePostPage() {
    const { user, profile } = useAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    if (profile?.is_blocked) {
        return (
            <Container className="create-post-page">
                <Header />

                <Alert.Root status="error" className="create-post-page__alert">
                    <Alert.Indicator />

                    <Alert.Content>
                        <Alert.Title>
                            You cannot create posts
                        </Alert.Title>

                        <Alert.Description>
                            Your account is currently blocked. You can still browse the forum,
                            but you cannot create posts until an administrator unblocks your
                            account.
                        </Alert.Description>
                    </Alert.Content>
                </Alert.Root>

                <Button className="create-post-page__back" onClick={() => navigate('/posts')}>
                    Back to Posts
                </Button>
            </Container>
        )
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (trimmedTitle.length < POST_TITLE_MIN_LENGTH || trimmedTitle.length > POST_TITLE_MAX_LENGTH) {
            toaster.create({ title: POST_TITLE_LENGTH_ERROR, type: 'error' });
            return;
        };

        if (trimmedContent.length < POST_CONTENT_MIN_LENGTH || trimmedContent.length > POST_CONTENT_MAX_LENGTH) {
            toaster.create({ title: POST_CONTENT_LENGTH_ERROR, type: 'error' });
            return;
        };

        try {
            setLoading(true)

            await createPost(
                {
                    title: trimmedTitle,
                    content: trimmedContent,
                },
                user.id
            )

            navigate('/posts');
        } catch (error) {
            toaster.create({ title: error.message, type: 'error' })
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="create-post-page">
            <Header />

            <Card.Root className="create-post-page__card">
                <Card.Header className="create-post-page__card-header">
                    <Flex className="create-post-page__title-row">
                        <Box className="create-post-page__icon"><LuPenLine /></Box>

                        <Heading size="sm" className="create-post-page__title">
                            Create a post
                        </Heading>
                    </Flex>
                </Card.Header>

                <Card.Body>
                    <form onSubmit={handleSubmit}>
                        <Stack className="create-post-page__form">
                            <Field.Root required>
                                <Field.Label>Title</Field.Label>

                                <Input
                                    placeholder="Ask something the forum can actually answer"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    minLength={POST_TITLE_MIN_LENGTH}
                                    maxLength={POST_TITLE_MAX_LENGTH}
                                />

                                <Field.HelperText>
                                    <Text
                                        as="span"
                                        className={title.length < POST_TITLE_MIN_LENGTH ? 'create-post-page__hint create-post-page__hint--error' : 'create-post-page__hint'}
                                    >
                                        {title.length < POST_TITLE_MIN_LENGTH
                                            ? `${POST_TITLE_MIN_LENGTH - title.length} more characters needed`
                                            : 'Looks good'}
                                    </Text>
                                    {' · '}
                                    {title.length}/{POST_TITLE_MAX_LENGTH}
                                </Field.HelperText>
                            </Field.Root>

                            <Field.Root required>
                                <Field.Label>Content</Field.Label>

                                <Textarea
                                    placeholder="Give some context, then ask your question. Posts that explain the reasoning behind them get better replies."
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                    minLength={POST_CONTENT_MIN_LENGTH}
                                    maxLength={POST_CONTENT_MAX_LENGTH}
                                    rows={POST_CONTENT_ROWS}
                                    className="create-post-page__content"
                                />

                                <Field.HelperText>
                                    <Text
                                        as="span"
                                        className={content.length < POST_CONTENT_MIN_LENGTH ? 'create-post-page__hint create-post-page__hint--error' : 'create-post-page__hint'}
                                    >
                                        {content.length < POST_CONTENT_MIN_LENGTH
                                            ? `${POST_CONTENT_MIN_LENGTH - content.length} more characters needed`
                                            : 'Looks good'}
                                    </Text>
                                    {' · '}
                                    {content.length}/{POST_CONTENT_MAX_LENGTH}
                                </Field.HelperText>
                            </Field.Root>


                            <Stack className="create-post-page__actions">
                                <Button type="submit" loading={loading} loadingText="Creating...">
                                    Create Post
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={loading}
                                    onClick={() => navigate('/posts')}
                                >
                                    Cancel
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Card.Body>
            </Card.Root>
        </Container>
    )
}

export default CreatePostPage;
