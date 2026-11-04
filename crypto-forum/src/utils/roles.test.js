import { describe, it, expect } from 'vitest';
import { canModerate } from './roles.js';

describe('canModerate', () => {
    it('allows active moderators and admins', () => {
        expect(canModerate({ role: 'moderator', is_blocked: false })).toBe(true);
        expect(canModerate({ role: 'admin', is_blocked: false })).toBe(true);
    });

    it('denies a blocked moderator', () => {
        expect(canModerate({ role: 'moderator', is_blocked: true })).toBe(false);
    });

    it('denies a blocked admin', () => {
        expect(canModerate({ role: 'admin', is_blocked: true })).toBe(false);
    });

    it('denies plain users and a missing profile', () => {
        expect(canModerate({ role: 'user', is_blocked: false })).toBe(false);
        expect(canModerate(null)).toBe(false);
    });
});
