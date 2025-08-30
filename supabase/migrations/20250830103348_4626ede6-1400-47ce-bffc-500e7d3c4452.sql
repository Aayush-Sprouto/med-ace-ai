-- Make the current user an admin for testing
-- Get the current user and assign admin role
DO $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get the first user from auth.users (assuming this is you)
    SELECT id INTO current_user_id 
    FROM auth.users 
    ORDER BY created_at 
    LIMIT 1;
    
    -- If we found a user, make them admin
    IF current_user_id IS NOT NULL THEN
        -- Remove any existing role for this user
        DELETE FROM public.user_roles WHERE user_id = current_user_id;
        
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role, assigned_by)
        VALUES (current_user_id, 'admin', current_user_id);
        
        RAISE NOTICE 'User % has been assigned admin role', current_user_id;
    ELSE
        RAISE NOTICE 'No users found in the system';
    END IF;
END $$;