-- Enable Realtime for the messages table
-- This allows postgres_changes subscriptions to receive INSERT/UPDATE/DELETE events

-- Set REPLICA IDENTITY to FULL so all column changes are included in realtime events
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Add the messages table to the supabase_realtime publication
-- This enables broadcasting of changes to subscribed clients
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
