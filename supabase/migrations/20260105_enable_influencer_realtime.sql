-- Enable Supabase Realtime for Influencer table
-- This allows real-time updates for activity status changes

ALTER PUBLICATION supabase_realtime ADD TABLE "Influencer";
