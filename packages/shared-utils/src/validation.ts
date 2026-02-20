import { z } from 'zod'

// Basic field schemas
export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')

export const channelNameSchema = z
  .string()
  .min(1, 'Channel name is required')
  .max(50, 'Channel name must be at most 50 characters')

export const channelDescriptionSchema = z
  .string()
  .max(200, 'Description must be at most 200 characters')
  .optional()

export const messageContentSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(2000, 'Message must be at most 2000 characters')

// Composite schemas
export const createChannelSchema = z.object({
  name: channelNameSchema,
  description: channelDescriptionSchema
})

export const sendMessageSchema = z.object({
  content: messageContentSchema
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema
})

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})
