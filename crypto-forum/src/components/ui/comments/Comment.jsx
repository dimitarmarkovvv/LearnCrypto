import { Avatar, Box, Button, Flex, HStack, IconButton, Text, Textarea } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../utils/formatDate.js';
import { getAvatarUrl } from '../../../services/profiles.js';

function Comment({
    comment,
    depth = 0,
    parentComment = null,
    userId,
    canModerate = false,
    isBlocked,
    commentVotes,

    editingCommentId,
    editCommentContent,
    setEditingCommentId,
    setEditCommentContent,
    handleEditComment,

    replyingTo,
    replyContent,
    setReplyingTo,
    setReplyContent,
    handleComment,

    handleCommentVote,
    setCommentToDelete,
}) {
    const navigate = useNavigate();

    const isRootComment = depth === 0;
    const shouldIndent = depth > 0 && depth <= 3;
    const isDeepReply = depth > 3;
    const isOwner = comment.author_id === userId;
    const showControls = isOwner || canModerate;

    const voteData = commentVotes[comment.id] ?? {
        score: 0,
        userVote: 0,
    };

    return (
        <Box
            ml={shouldIndent ? 6 : 0}
            mt={depth > 0 ? 2 : 0}
        >
            <Box
                borderWidth={isRootComment ? '1px' : '0'}
                borderRadius={isRootComment ? 'md' : '0'}
                borderLeftWidth={
                    !isRootComment && depth <= 3 ? '1px' : '0'
                }
                p={isRootComment ? 4 : 0}
                pl={!isRootComment && depth <= 3 ? 3 : 0}
                py={!isRootComment ? 2 : undefined}
            >
                <Flex gap={3} align="start">
                    <Avatar.Root
                        size={isRootComment ? 'sm' : 'xs'}
                        borderRadius="full"
                        overflow="hidden"
                        flexShrink={0}
                    >
                        <Avatar.Fallback name={comment.profiles?.username} />

                        {comment.profiles?.avatar_url && (
                            <Avatar.Image
                                src={getAvatarUrl(comment.profiles.avatar_url)}
                                alt={`${comment.profiles.username}'s avatar`}
                            />
                        )}
                    </Avatar.Root>

                    <Box flex="1" minW={0}>
                    {isDeepReply && parentComment && (
                        <Text
                            fontSize="xs"
                            color="fg.muted"
                            mb={1}
                        >
                            Replying to {parentComment.profiles.username}
                        </Text>
                    )}

                    {editingCommentId === comment.id ? (
                        <Box>
                            <Textarea
                                size="sm"
                                value={editCommentContent}
                                onChange={(event) =>
                                    setEditCommentContent(event.target.value)
                                }
                            />

                            <HStack mt={2}>
                                <Button
                                    type="button"
                                    size="xs"
                                    onClick={() =>
                                        handleEditComment(comment.id)
                                    }
                                >
                                    Save
                                </Button>

                                <Button
                                    type="button"
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => {
                                        setEditingCommentId(null);
                                        setEditCommentContent('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </HStack>
                        </Box>
                    ) : (
                        comment.is_deleted ? (
                            <Text
                                fontStyle="italic"
                                color="fg.muted"
                            >
                                [deleted]
                            </Text>
                        ) : (
                            <Text>{comment.content}</Text>
                        )
                    )}

                    {!comment.is_deleted && (
                        <Text
                            fontSize="sm"
                            color="fg.muted"
                            mt={1}
                        >
                            by{' '}
                            <Text
                                as="span"
                                cursor="pointer"
                                _hover={{ textDecoration: 'underline' }}
                                onClick={() =>
                                    navigate(`/users/${comment.author_id}`)
                                }
                            >
                                {comment.profiles.username}
                            </Text>

                            {' - '}

                            {formatDate(comment.created_at)}
                        </Text>
                    )}

                    {!comment.is_deleted && (
                        <HStack w="full" mt={1} gap={1}>
                            <IconButton
                                type="button"
                                aria-label="Upvote"
                                size="xs"
                                variant={voteData.userVote === 1 ? 'subtle' : 'ghost'}
                                colorPalette={
                                    voteData.userVote === 1
                                        ? 'green'
                                        : 'gray'
                                }
                                onClick={() =>
                                    handleCommentVote(comment.id, 1)
                                }
                            >
                                ▲
                            </IconButton>

                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                minW="20px"
                                textAlign="center"
                            >
                                {voteData.score}
                            </Text>

                            <IconButton
                                type="button"
                                aria-label="Downvote"
                                size="xs"
                                variant={voteData.userVote === -1 ? 'subtle' : 'ghost'}
                                colorPalette={
                                    voteData.userVote === -1
                                        ? 'red'
                                        : 'gray'
                                }
                                onClick={() =>
                                    handleCommentVote(comment.id, -1)
                                }
                            >
                                ▼
                            </IconButton>

                            <Button
                                type="button"
                                size="xs"
                                variant="ghost"
                                disabled={isBlocked}
                                onClick={() => {
                                    setReplyingTo(comment.id);
                                    setReplyContent('');
                                }}
                            >
                                Reply
                            </Button>

                            {showControls && (
                                <HStack ml="auto">
                                    <Button
                                        type="button"
                                        size="xs"
                                        variant="ghost"
                                        disabled={isBlocked}
                                        onClick={() => {
                                            setEditingCommentId(comment.id);
                                            setEditCommentContent(comment.content);
                                        }}
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        type="button"
                                        size="xs"
                                        variant="ghost"
                                        colorPalette="red"
                                        disabled={isBlocked}
                                        onClick={() =>
                                            setCommentToDelete(comment.id)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </HStack>
                            )}
                        </HStack>
                    )}

                    {replyingTo === comment.id && !comment.is_deleted && (
                        <Box mt={2}>
                            <Textarea
                                size="sm"
                                placeholder={`Reply to ${comment.profiles.username}...`}
                                value={replyContent}
                                onChange={(event) =>
                                    setReplyContent(event.target.value)
                                }
                            />

                            <HStack mt={2}>
                                <Button
                                    type="button"
                                    size="xs"
                                    onClick={() =>
                                        handleComment(comment.id)
                                    }
                                >
                                    Reply
                                </Button>

                                <Button
                                    type="button"
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => {
                                        setReplyingTo(null);
                                        setReplyContent('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </HStack>
                        </Box>
                    )}
                    </Box>
                </Flex>
            </Box>

            {comment.replies?.length > 0 && (
                <Box>
                    {comment.replies.map((reply) => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            depth={depth + 1}
                            parentComment={comment}
                            userId={userId}
                            canModerate={canModerate}
                            isBlocked={isBlocked}
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
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default Comment;