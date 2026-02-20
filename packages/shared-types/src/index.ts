// Database types matching Supabase schema
export interface Profile {
  id: string
  username: string
  created_at: string
}

export interface Channel {
  id: string
  name: string
  description?: string
  creator_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  content: string
  user_id: string
  channel_id: string
  created_at: string
  updated_at: string
  profiles?: {
    username: string
  }
}

export interface ChannelMember {
  id: string
  channel_id: string
  user_id: string
  joined_at: string
}

export interface ChannelInvitation {
  id: string
  channel_id: string
  invited_email: string
  invited_by_user_id: string
  token: string
  status: 'pending' | 'accepted' | 'revoked'
  created_at: string
  expires_at: string
  accepted_at?: string
  revoked_at?: string
}

// API request types
export interface CreateChannelRequest {
  name: string
  description?: string
}

export interface SendMessageRequest {
  content: string
  channel_id: string
}

export interface InviteUserRequest {
  email: string
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    username?: string
  }
}
