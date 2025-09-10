import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

// Helper: fetch attachments for a comment
async function getAttachments(commentId: string) {
  const { data, error } = await supabase
    .from('comment_attachments')
    .select('id, file_url, file_type, uploaded_at')
    .eq('comment_id', commentId);
  if (error) return [];
  return data;
}

// Helper: fetch comments recursively (threaded)
async function getComments(context_type: string, context_id: string) {
  // Fetch all comments for the context
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('context_type', context_type)
    .eq('context_id', context_id)
    .order('created_at', { ascending: true });

  if (error || !comments) return [];

  // Attachments and threading
  const commentMap: Record<string, any> = {};
  for (const comment of comments) {
    comment.attachments = await getAttachments(comment.id);
    comment.children = [];
    commentMap[comment.id] = comment;
  }
  const roots = [];
  for (const comment of comments) {
    if (comment.parent_id) {
      commentMap[comment.parent_id]?.children.push(comment);
    } else {
      roots.push(comment);
    }
  }
  return roots;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Query: context_type, context_id
    const { context_type, context_id } = req.query;
    if (!context_type || !context_id) {
      return res.status(400).json({ error: 'Missing context_type or context_id' });
    }
    const comments = await getComments(context_type as string, context_id as string);
    return res.status(200).json({ comments });
  }

  if (req.method === 'POST') {
    // Body: user_id, context_type, context_id, content, parent_id, mentions, attachments (array of {file_url, file_type})
    const { user_id, context_type, context_id, content, parent_id, mentions, attachments } = req.body;
    if (!user_id || !context_type || !context_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([{
        user_id,
        context_type,
        context_id,
        content,
        parent_id: parent_id || null,
        mentions: mentions || [],
      }])
      .select()
      .single();

    if (error || !comment) {
      return res.status(500).json({ error: error?.message || 'Failed to create comment' });
    }

    // Insert attachments if any
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        await supabase.from('comment_attachments').insert([{
          comment_id: comment.id,
          file_url: att.file_url,
          file_type: att.file_type,
        }]);
      }
    }

    // TODO: Trigger email notifications for mentions
    // TODO: Trigger real-time update (if using Supabase Realtime or similar)

    // Return the new comment with attachments
    comment.attachments = attachments || [];
    comment.children = [];
    return res.status(201).json({ comment });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}