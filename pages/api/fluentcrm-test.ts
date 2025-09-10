import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { WP_URL, FLUENTCRM_KEY } = process.env;
  if (!WP_URL || !FLUENTCRM_KEY) {
    return res.status(500).json({ error: 'Missing FluentCRM credentials in env' });
  }
  // FluentCRM REST API endpoint for contacts
  const url = `${WP_URL}/wp-json/fluent-crm/v2/contacts?per_page=1&api_key=${FLUENTCRM_KEY}`;
  try {
    const crmRes = await fetch(url);
    const data = await crmRes.json();
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'FluentCRM fetch failed' });
  }
}