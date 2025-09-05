-- Add indexes for chat message queries to optimize participant ordering

-- Note: Primary key index (id) already exists automatically - used in the JOIN condition
-- Note: IDX_chat_messages_created_at (created_at) already exists from V00038
-- Note: FK_chat_messages_sender (sender_id) already exists from V00038  
-- Note: FK_chat_messages_recipient (recipient_id) already exists from V00038

-- Composite index for sender + recipient + created_at (covers both directions in subquery)
CREATE INDEX idx_chat_messages_sender_recipient_created_at 
ON chat_messages (sender_id, recipient_id, created_at DESC);

-- Composite index for recipient + sender + created_at (covers reverse direction in subquery)  
CREATE INDEX idx_chat_messages_recipient_sender_created_at 
ON chat_messages (recipient_id, sender_id, created_at DESC);

-- Additional index to help with the OR condition in the subquery
-- This covers cases where we need to quickly find messages between two specific users
CREATE INDEX idx_chat_messages_conversation_lookup
ON chat_messages (sender_id, recipient_id, created_at DESC, id);