/**
 * Required environment variables:
 * WP_URL
 * GR_ASTON_WP_BASIC_AUTH
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!process.env.WP_URL || !process.env.GR_ASTON_WP_BASIC_AUTH) {
        console.warn('Missing required environment variables: WP_URL, GR_ASTON_WP_BASIC_AUTH')
        return res.status(500).json({ error: 'Server misconfiguration. Missing required environment variables.' })
    }
  const { eventId } = req.query
  if (!eventId || Array.isArray(eventId)) {
    return res.status(400).json({ error: 'Missing or invalid eventId query parameter' })
  }
  try {
    const response = await axios.get(
      `${process.env.WP_URL}/wp-json/wp/v2/events/${eventId}/students`,
      {
        headers: {
          Authorization: `Basic ${process.env.GR_ASTON_WP_BASIC_AUTH}`,
        },
      }
    )
    res.status(200).json(response.data)
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch students' })
  }
}