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
  const { id } = req.query
  try {
    const response = await axios.get(
      `${process.env.WP_URL}/wp-json/wp/v2/events/${id}`,
      {
        headers: {
          Authorization: `Basic ${process.env.GR_ASTON_WP_BASIC_AUTH}`,
        },
      }
    )
    res.status(200).json(response.data)
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch event' })
  }
}