export const POST_TITLE_MIN_LENGTH = 16;
export const POST_TITLE_MAX_LENGTH = 64;
export const POST_CONTENT_MIN_LENGTH = 32;
export const POST_CONTENT_MAX_LENGTH = 8192;
export const POST_CONTENT_ROWS = 14;

export const POST_TITLE_LENGTH_ERROR = `Title must be between ${POST_TITLE_MIN_LENGTH} and ${POST_TITLE_MAX_LENGTH} characters.`;
export const POST_CONTENT_LENGTH_ERROR = `Content must be between ${POST_CONTENT_MIN_LENGTH} and ${POST_CONTENT_MAX_LENGTH} characters.`;

export const PROFILE_NAME_MIN_LENGTH = 4;
export const PROFILE_NAME_MAX_LENGTH = 32;
export const PROFILE_LOCATION_MIN_LENGTH = 4;
export const PROFILE_LOCATION_MAX_LENGTH = 64;
export const PROFILE_SIGNATURE_MAX_LENGTH = 100;
export const PROFILE_POSTS_LIMIT = 100;

export const PROFILE_NAME_LENGTH_ERROR = `First and last name must be between ${PROFILE_NAME_MIN_LENGTH} and ${PROFILE_NAME_MAX_LENGTH} characters.`;
export const PROFILE_LOCATION_LENGTH_ERROR = `Location must be between ${PROFILE_LOCATION_MIN_LENGTH} and ${PROFILE_LOCATION_MAX_LENGTH} characters.`;

export const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
];
