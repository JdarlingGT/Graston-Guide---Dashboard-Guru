import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { SUPABASE_URL, SUPABASE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Missing Supabase credentials in env' });
  }
  // Replace 'your_table' with your actual table name
  const url = `${SUPABASE_URL}/rest/v1/your_table?select=*&limit=1`;
  try {
    const sbRes = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const data = await sbRes.json();
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Supabase fetch failed' });
  }
}