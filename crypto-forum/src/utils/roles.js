export const ROLES = ['user', 'moderator', 'admin'];

const MODERATOR_ROLES = ['moderator', 'admin'];

export const isAdmin = (profile) => profile?.role === 'admin';

export const canModerate = (profile) =>
    MODERATOR_ROLES.includes(profile?.role) && !profile?.is_blocked;