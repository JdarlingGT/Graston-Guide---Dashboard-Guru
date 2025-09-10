import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const wpUrl = `${process.env.WP_URL}/wp-json/graston/v1/events`
    const response = await axios.get(wpUrl, {
      headers: {
        Authorization: `Basic ${process.env.GR_ASTON_WP_BASIC_AUTH}`
      }
    })
    res.status(200).json(response.data)
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: 'API error' })
  }
}
