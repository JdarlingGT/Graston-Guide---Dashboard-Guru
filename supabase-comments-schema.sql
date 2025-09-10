-- Comments table for threaded, contextual, real-time comments with attachments and mentions

create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  context_type text not null check (context_type in ('event', 'student')),
  context_id uuid not null,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  mentions text[] default '{}', -- array of staff emails
  created_at timestamptz not null default now()
);

-- Attachments table for files (images, PDFs) linked to comments
create table if not exists comment_attachments (
  id uuid primary key default uuid_generate_v4(),
  comment_id uuid references comments(id) on delete cascade,
  file_url text not null,
  file_type text, -- e.g. 'image/png', 'application/pdf'
  uploaded_at timestamptz not null default now()
);

-- Index for fast lookup by context
create index if not exists idx_comments_context on comments (context_type, context_id);

-- Index for threaded lookup
create index if not exists idx_comments_parent on comments (parent_id);

-- Index for mentions (array field)
create index if not exists idx_comments_mentions on comments using gin (mentions);

-- Index for attachments by comment
create index if not exists idx_comment_attachments_comment_id on comment_attachments (comment_id);

-- Notes:
-- - user_id references the Supabase auth.users table (adjust if your user PK is different)
-- - context_type/context_id allow comments to be attached to either events or students
-- - parent_id enables threading (null for top-level comments)
-- - mentions is an array of staff emails for @mention notifications
-- - comment_attachments stores file URLs (use Supabase Storage for actual files)