-- Add foreign key constraint to company_settings.user_id only
-- This ensures referential integrity and automatic cleanup when users are deleted
ALTER TABLE public.company_settings
ADD CONSTRAINT company_settings_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;