import { useNavigate, Link as RouterLink } from "react-router-dom";
import { LuPencil, LuTrash2, LuMessageSquare } from 'react-icons/lu';
import { useParams } from "react-router-dom";
import { deletePost, getPostById } from "../../services/posts.js";
import { useEffect, useState } from "react";
import { Avatar, Button, Card, Center, Container, Flex, Heading, IconButton, Spacer, Spinner, HStack, Text, Stack, Textarea, Box, NativeSelect, Link } from '@chakra-ui/react';
import { toaster } from '../../components/ui/toast-store.js';
import { formatDate } from "../../utils/formatDate.js";
import { useAuth } from "../../hooks/useAuth.js";
import { canModerate } from "../../utils/roles.js";
import { Header } from '../../components/ui/Header.jsx';
import { getCommentsByPostId } from "../../services/comments.js";
import { getAvatarUrl } from "../../services/profiles.js";
import { castVote, getPostVotes, removeVote, } from "../../services/votes.js";
import { buildCommentTree } from '../../utils/buildCommentTree.js';
import Comment from '../../components/ui/comments/Comment.jsx'
import DeleteCommentDialog from '../../components/ui/comments/DeleteCommentDialog.jsx';
import DeletePostDialog from '../../components/ui/DeletePostDialog.jsx';
import { useComments } from '../../hooks/useComments.js';
import { useCommentVotes } from '../../hooks/useCommentVotes.js';
import './PostDetailsPage.css';

function PostDetailsPage() {
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const { id } = useParams();
    const [pageLoading, setPageLoading] = useState(true);
    const { user, profile } = useAuth();
    const isModerator = canModerate(profile);
    const [score, setScore] = useState(0);
    const [userVote, setUserVote] = useState(0);
    const [sort, setSort] = useState('newest');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const {
        comments,
        setComments,

        newComments,
        setNewComments,

        replyingTo,
        setReplyingTo,

        replyContent,
        setReplyContent,

        editingCommentId,
        setEditingCommentId,

        editCommentContent,
        setEditCommentContent,

        commentToDelete,
        setCommentToDelete,

        handleComment,
        handleEditComment,
        handleDeleteComment,
    } = useComments({
        postId: id,
        user,
        profile,
        sort,
    });

    const {
        commentVotes,
        handleCommentVote,
    } = useCommentVotes({
        comments,
        userId: user.id,
    });

    const commentTree = buildCommentTree(comments);


    const handleDelete = async () => {
        setDeleting(true);

        try {
            await deletePost(id);
            navigate('/posts');
        } catch (error) {
            toaster.create({ title: error.message, type: 'error' });
            setDeleteOpen(false);
        } finally {
            setDeleting(false);
        };
    };

    const handleVoteValue = async (value) => {
        try {
            if (userVote === value) {
                await removeVote(id, user.id, value);
            } else {
                await castVote(id, user.id, value);
            };

            const { score: fetchedScore, userVote: fetchedUserVote } = await getPostVotes(id, user.id);
            setScore(fetchedScore);
            setUserVote(fetchedUserVote);

        } catch (error) {
            toaster.create({ title: error.message, type: 'error' });
        }
    };

    useEffect(() => {
        const loadPost = async () => {
            setPageLoading(true);

            try {
                const post = await getPostById(id);
                setPost(post);
                const commentData = await getCommentsByPostId(id, sort);
                setComments(commentData);

                const { score: fetchedScore, userVote: fetchedUserVote } = await getPostVotes(id, user.id);
                setScore(fetchedScore);
                setUserVote(fetchedUserVote);
            } catch (e) {
                toaster.create({ title: e.message, type: 'error' });
            } finally {
                setPageLoading(false);
            };
        };

        loadPost();
    }, [id, user.id, sort, setComments]);

    if (pageLoading) {
        return (
            <Center><Spinner /></Center>
        );
    };

    return (
        <Container className="post-details-page">
            <Header />

            <Card.Root as="article" className="post-details-page__card">
                <Card.Body>
                    <Heading className="post-details-page__title">{post.title}</Heading>

                    <Flex className="post-details-page__author">
                        <Link asChild>
                            <RouterLink to={`/users/${post.author_id}`}>
                                <Avatar.Root
                                    size="sm"
                                    className="post-details-page__avatar"
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

                        <Text className="post-details-page__byline">
                            by{' '}
                            <Link asChild className="post-details-page__inherit-link">
                                <RouterLink to={`/users/${post.author_id}`}>
                                    {post.profiles.username}
                                </RouterLink>
                            </Link>
                            {' · '}
                            {formatDate(post.created_at)}
                        </Text>
                    </Flex>

                    <Text className="post-details-page__content">{post.content}</Text>
                </Card.Body>

                <Card.Footer className="post-details-page__footer">
                    <HStack className="post-details-page__votes">
                        <IconButton
                            aria-label="Upvote"
                            size="sm"
                            variant={userVote === 1 ? 'subtle' : 'ghost'}
                            colorPalette={userVote === 1 ? 'green' : 'gray'}
                            onClick={() => handleVoteValue(1)}
                        >
                            ▲
                        </IconButton>

                        <Text className="post-details-page__score">
                            {score}
                        </Text>

                        <IconButton
                            aria-label="Downvote"
                            size="sm"
                            variant={userVote === -1 ? 'subtle' : 'ghost'}
                            colorPalette={userVote === -1 ? 'red' : 'gray'}
                            onClick={() => handleVoteValue(-1)}
                        >
                            ▼
                        </IconButton>
                    </HStack>

                    <Spacer />

                    {(post.author_id === user.id || isModerator) && (
                        <HStack className="post-details-page__owner-actions">
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={profile?.is_blocked}
                                onClick={() => navigate(`/posts/${id}/edit`)}
                            >
                                <LuPencil /> Edit
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <LuTrash2 /> Delete
                            </Button>
                        </HStack>
                    )}
                </Card.Footer>
            </Card.Root>

            <Card.Root as="section" className="post-details-page__card">
                <Card.Header className="post-details-page__comments-header">
                    <Flex className="post-details-page__comments-header-row">
                        <Flex className="post-details-page__comments-title-row">
                            <Box className="post-details-page__icon"><LuMessageSquare /></Box>

                            <Heading size="sm" className="post-details-page__section-title">
                                Comments
                            </Heading>

                            <Text className="post-details-page__count">
                                ({commentTree.length})
                            </Text>
                        </Flex>

                        <NativeSelect.Root size="sm" className="post-details-page__sort">
                            <NativeSelect.Field
                                value={sort}
                                onChange={(event) => setSort(event.target.value)}
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>
                    </Flex>
                </Card.Header>

                <Card.Body>

            <Stack className="post-details-page__comments">
                {commentTree.length === 0 ? (
                    <Text>No comments yet.</Text>
                ) : (
                    commentTree.map((comment) => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            userId={user.id}
                            canModerate={isModerator}
                            isBlocked={profile?.is_blocked}
                            commentVotes={commentVotes}

                            editingCommentId={editingCommentId}
                            editCommentContent={editCommentContent}
                            setEditingCommentId={setEditingCommentId}
                            setEditCommentContent={setEditCommentContent}
                            handleEditComment={handleEditComment}

                            replyingTo={replyingTo}
                            replyContent={replyContent}
                            setReplyingTo={setReplyingTo}
                            setReplyContent={setReplyContent}
                            handleComment={handleComment}

                            handleCommentVote={handleCommentVote}
                            setCommentToDelete={setCommentToDelete}
                        />
                    ))
                )}
            </Stack>

            {profile?.is_blocked ? (
                <Box className="post-details-page__blocked">
                    <Text className="post-details-page__blocked-title">
                        Commenting disabled
                    </Text>

                    <Text className="post-details-page__blocked-text">
                        You cannot post comments or replies while your account is blocked.
                    </Text>
                </Box>
            ) : (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleComment();
                    }}
                >
                    <Textarea
                        className="post-details-page__comment-input"
                        placeholder="Write a comment..."
                        value={newComments}
                        onChange={(event) => setNewComments(event.target.value)}
                        required
                    />

                    <Button type="submit" className="post-details-page__comment-submit">
                        Post Comment
                    </Button>
                </form>
            )}
                </Card.Body>
            </Card.Root>

            <DeletePostDialog
                open={deleteOpen}
                setOpen={setDeleteOpen}
                handleDeletePost={handleDelete}
                loading={deleting}
            />

            <DeleteCommentDialog
                commentToDelete={commentToDelete}
                setCommentToDelete={setCommentToDelete}
                handleDeleteComment={handleDeleteComment}
            />
        </Container>
    );
};

export default PostDetailsPage;