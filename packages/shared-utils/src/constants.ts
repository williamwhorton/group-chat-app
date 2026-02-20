export const APP_NAME = 'Treehouse'
export const MAX_MESSAGE_LENGTH = 2000
export const MAX_CHANNEL_NAME_LENGTH = 50
export const MAX_CHANNEL_DESCRIPTION_LENGTH = 200
export const MAX_USERNAME_LENGTH = 20
export const MIN_USERNAME_LENGTH = 3
export const MIN_PASSWORD_LENGTH = 8
export const INVITATION_EXPIRY_DAYS = 7
export const MESSAGE_PAGE_SIZE = 50

export const ERROR_MESSAGES = {
  AUTH: {
    NOT_AUTHENTICATED: 'You must be logged in',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'Email already registered'
  },
  CHANNEL: {
    NOT_FOUND: 'Channel not found',
    NO_ACCESS: 'You do not have access to this channel',
    NOT_OWNER: 'Only the channel owner can perform this action'
  },
  MESSAGE: {
    TOO_LONG: `Message must be at most ${MAX_MESSAGE_LENGTH} characters`,
    EMPTY: 'Message cannot be empty'
  }
}
