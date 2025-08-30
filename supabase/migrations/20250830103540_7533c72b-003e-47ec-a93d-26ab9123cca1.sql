-- Add some sample data for testing the admin panel
-- This will create sample conversations and messages for realistic admin dashboard data

-- Insert sample conversations for the admin user
INSERT INTO public.conversations (user_id, title, created_at, updated_at) 
SELECT 
    ur.user_id,
    'Sample Conversation ' || generate_series,
    now() - (generate_series || ' hours')::interval,
    now() - (generate_series || ' hours')::interval
FROM generate_series(1, 5),
     public.user_roles ur 
WHERE ur.role = 'admin'
LIMIT 5;

-- Insert sample messages for these conversations
WITH admin_conversations AS (
    SELECT c.id as conversation_id
    FROM public.conversations c
    JOIN public.user_roles ur ON c.user_id = ur.user_id
    WHERE ur.role = 'admin'
),
message_data AS (
    SELECT 
        ac.conversation_id,
        'What is the difference between arteries and veins?' as content,
        'user' as role,
        now() - (row_number() OVER () || ' hours')::interval as created_at
    FROM admin_conversations ac
    UNION ALL
    SELECT 
        ac.conversation_id,
        'Arteries carry oxygenated blood away from the heart to the body tissues, while veins carry deoxygenated blood back to the heart. Arteries have thicker walls and higher pressure compared to veins.' as content,
        'assistant' as role,
        now() - (row_number() OVER () || ' hours')::interval + interval '5 minutes' as created_at
    FROM admin_conversations ac
)
INSERT INTO public.messages (conversation_id, content, role, created_at)
SELECT conversation_id, content, role, created_at
FROM message_data;

-- Update user statistics for the admin user
WITH admin_user AS (
    SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1
),
stats AS (
    SELECT 
        au.user_id,
        COUNT(DISTINCT c.id) as session_count,
        COUNT(CASE WHEN m.role = 'user' THEN 1 END) as question_count
    FROM admin_user au
    LEFT JOIN public.conversations c ON c.user_id = au.user_id
    LEFT JOIN public.messages m ON m.conversation_id = c.id
    GROUP BY au.user_id
)
INSERT INTO public.user_statistics (user_id, questions_asked, study_sessions, topics_covered, last_active_at)
SELECT 
    user_id,
    question_count,
    session_count,
    LEAST(question_count / 2, 8), -- Estimate topics covered
    now()
FROM stats
ON CONFLICT (user_id) 
DO UPDATE SET 
    questions_asked = EXCLUDED.questions_asked,
    study_sessions = EXCLUDED.study_sessions,
    topics_covered = EXCLUDED.topics_covered,
    last_active_at = EXCLUDED.last_active_at;