import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { WP_URL, WC_KEY, WC_SECRET } = process.env;
  if (!WP_URL || !WC_KEY || !WC_SECRET) {
    return res.status(500).json({ error: 'Missing WooCommerce credentials in env' });
  }
  const url = `${WP_URL}/wp-json/wc/v3/orders?per_page=1`;
  const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  try {
    const wcRes = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await wcRes.json();
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'WooCommerce fetch failed' });
  }
}