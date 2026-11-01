import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Heading,
    HStack,
    Input,
    Menu,
    Portal,
    Spinner,
    Stack,
    Table,
    Text,
} from '@chakra-ui/react';
import {
    adminSearchUsers,
    getAvatarUrl,
    promoteUser,
    setUserBlocked,
} from '../../services/profiles.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/roles.js';
import { LuChevronDown } from 'react-icons/lu';
import { toaster } from '../../components/ui/toast-store.js';
import BlockUserDialog from '../../components/ui/admin/BlockUserDialog.jsx';
import RoleChangeDialog from '../../components/ui/admin/RoleChangeDialog.jsx';
import PostManagement from '../../components/ui/admin/PostManagement.jsx';
import { Header } from '../../components/ui/Header.jsx';
import './AdminDashboardPage.css';


const ROLE_LABELS = {
    user: 'User',
    moderator: 'Moderator',
    admin: 'Admin',
};

function AdminDashboardPage() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loadingUsers, setloadingUsers] = useState(true);
    const [userToBlock, setUserToBlock] = useState(null);
    const [roleChange, setRoleChange] = useState(null);

    const { user } = useAuth() ?? {};

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setloadingUsers(true);

                const data = await adminSearchUsers(searchTerm);

                setUsers(data);
            } catch (error) {
                toaster.create({
                    title: error.message,
                    type: 'error',
                })
            } finally {
                setloadingUsers(false);
            }
        }

        loadUsers()
    }, [searchTerm])

    const handleBlockToggle = async (userId, blocked) => {
        try {
            await setUserBlocked(userId, blocked);

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId
                        ? { ...user, is_blocked: blocked }
                        : user
                )
            );

            toaster.create({
                title: blocked
                    ? 'User blocked'
                    : 'User unblocked',
                type: 'success',
            });

            return true;
        } catch (error) {
            toaster.create({
                title: error.message,
                type: 'error',
            });

            return false;
        }
    };

    const handleConfirmBlock = async () => {
        if (!userToBlock) {
            return;
        }

        const success = await handleBlockToggle(
            userToBlock.id,
            true
        );

        if (success) {
            setUserToBlock(null);
        }

    };

    const handleConfirmRoleChange = async () => {
        if (!roleChange) {
            return;
        }

        try {
            await promoteUser(roleChange.user.id, roleChange.nextRole);

            setUsers((prevUsers) =>
                prevUsers.map((prevUser) =>
                    prevUser.id === roleChange.user.id
                        ? { ...prevUser, role: roleChange.nextRole }
                        : prevUser
                )
            );

            toaster.create({
                title: `${roleChange.user.username} is now ${ROLE_LABELS[roleChange.nextRole]}`,
                type: 'success',
            });

            setRoleChange(null);
        } catch (error) {
            toaster.create({
                title: error.message,
                type: 'error',
            });
        }
    };

    return (
        <Container className="admin-page">
            <Header />

            <Stack className="admin-page__sections">
                <Box>
                    <Heading size="2xl">
                        Admin Dashboard
                    </Heading>

                    <Text className="admin-page__subtitle">
                        Manage users, posts and forum administration.
                    </Text>
                </Box>

                <Box>
                    <Input
                        placeholder="Search by username, email or name..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        className="admin-page__search"
                    />

                    {loadingUsers ? (
                        <Spinner />
                    ) : users.length === 0 ? (
                        <Text className="admin-page__muted">
                            No users found.
                        </Text>
                    ) : (
                        <Box className="admin-page__table-wrapper">
                            <Table.Root>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader>
                                            User
                                        </Table.ColumnHeader>

                                        <Table.ColumnHeader>
                                            Email
                                        </Table.ColumnHeader>

                                        <Table.ColumnHeader>
                                            Role
                                        </Table.ColumnHeader>

                                        <Table.ColumnHeader>
                                            Status
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader>
                                            Actions
                                        </Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {users.map((foundUser) => (
                                        <Table.Row key={foundUser.id}>
                                            <Table.Cell>
                                                <Box className="admin-page__user">
                                                    <Avatar.Root
                                                        className="admin-page__avatar"
                                                        onClick={() =>
                                                            navigate(
                                                                `/users/${foundUser.id}`
                                                            )
                                                        }
                                                    >
                                                        <Avatar.Fallback
                                                            name={`${foundUser.first_name} ${foundUser.last_name}`}
                                                        />

                                                        {foundUser.avatar_url && (
                                                            <Avatar.Image
                                                                src={getAvatarUrl(
                                                                    foundUser.avatar_url
                                                                )}
                                                            />
                                                        )}
                                                    </Avatar.Root>

                                                    <Box>
                                                        <Text
                                                            className="admin-page__username"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/users/${foundUser.id}`
                                                                )
                                                            }
                                                        >
                                                            {foundUser.username}
                                                        </Text>

                                                        <Text className="admin-page__name">
                                                            {foundUser.first_name}{' '}
                                                            {foundUser.last_name}
                                                        </Text>
                                                    </Box>
                                                </Box>
                                            </Table.Cell>

                                            <Table.Cell>
                                                {foundUser.email}
                                            </Table.Cell>

                                            <Table.Cell>
                                                <Badge
                                                    variant="subtle"
                                                >
                                                    {foundUser.role}
                                                </Badge>
                                            </Table.Cell>

                                            <Table.Cell>
                                                <Badge
                                                    colorPalette={
                                                        foundUser.is_blocked
                                                            ? 'red'
                                                            : 'green'
                                                    }
                                                >
                                                    {foundUser.is_blocked
                                                        ? 'Blocked'
                                                        : 'Active'}
                                                </Badge>
                                            </Table.Cell>

                                            <Table.Cell>
                                                {foundUser.id === user?.id ? (
                                                    <Badge
                                                        variant="subtle"
                                                        colorPalette="gray"
                                                    >
                                                        You
                                                    </Badge>
                                                ) : (
                                                    <HStack className="admin-page__actions">
                                                        <Menu.Root
                                                            onSelect={(details) =>
                                                                setRoleChange({
                                                                    user: foundUser,
                                                                    nextRole: details.value,
                                                                })
                                                            }
                                                        >
                                                            <Menu.Trigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                >
                                                                    Change role <LuChevronDown />
                                                                </Button>
                                                            </Menu.Trigger>

                                                            <Portal>
                                                                <Menu.Positioner>
                                                                    <Menu.Content>
                                                                        {ROLES.map((role) => (
                                                                            <Menu.Item
                                                                                key={role}
                                                                                value={role}
                                                                                disabled={
                                                                                    role === foundUser.role
                                                                                }
                                                                            >
                                                                                {ROLE_LABELS[role]}
                                                                            </Menu.Item>
                                                                        ))}
                                                                    </Menu.Content>
                                                                </Menu.Positioner>
                                                            </Portal>
                                                        </Menu.Root>

                                                        {foundUser.role === 'admin' ? null : foundUser.is_blocked ? (
                                                            <Button
                                                                size="sm"
                                                                colorPalette="green"
                                                                onClick={() =>
                                                                    handleBlockToggle(
                                                                        foundUser.id,
                                                                        false
                                                                    )
                                                                }
                                                            >
                                                                Unblock
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                colorPalette="red"
                                                                onClick={() =>
                                                                    setUserToBlock(foundUser)
                                                                }
                                                            >
                                                                Block
                                                            </Button>
                                                        )}
                                                    </HStack>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    )}
                </Box>

                <BlockUserDialog
                    userToBlock={userToBlock}
                    setUserToBlock={setUserToBlock}
                    handleConfirmBlock={handleConfirmBlock}
                />

                <RoleChangeDialog
                    roleChange={roleChange}
                    setRoleChange={setRoleChange}
                    handleConfirmRoleChange={handleConfirmRoleChange}
                />

                <PostManagement />
            </Stack>
        </Container>
    );
}

export default AdminDashboardPage;