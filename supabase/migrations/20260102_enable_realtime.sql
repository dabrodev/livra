-- Enable Supabase Realtime for Memory and Post tables
-- Run this in your Supabase SQL Editor

-- Enable replication for Memory table
ALTER PUBLICATION supabase_realtime ADD TABLE "Memory";

-- Enable replication for Post table  
ALTER PUBLICATION supabase_realtime ADD TABLE "Post";

-- Note: You may need to run this if the publication doesn't exist:
-- CREATE PUBLICATION supabase_realtime FOR TABLE "Memory", "Post";
