import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
  if (!WP_URL || !WP_USER || !WP_APP_PASSWORD) {
    return res.status(500).json({ error: 'Missing WordPress credentials in env' });
  }
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  try {
    const wpRes = await fetch(`${WP_URL}/wp-json/wp/v2/posts?per_page=1`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    const data = await wpRes.json();
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'WordPress fetch failed' });
  }
}