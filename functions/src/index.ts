import { setGlobalOptions } from 'firebase-functions'
import { onRequest } from 'firebase-functions/https'
import * as logger from 'firebase-functions/logger'
import OpenAI from 'openai'

setGlobalOptions({ maxInstances: 10 })

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const OPEN_API_KEY = process.env.OPEN_API_KEY

logger.info(OPEN_API_KEY)
const openai = new OpenAI({
  apiKey: OPEN_API_KEY,
})

export const getCoordinates = onRequest(async (request, response) => {
  logger.info('Fetching coordinates...', { structuredData: true })

  const address = request.query.address as string

  if (!address) {
    response.status(400).send({ error: 'Missing address parameter' })
    return
  }

  try {
    const geocodeRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
      )}&key=${GOOGLE_API_KEY}`,
    )

    if (!geocodeRes.ok) {
      const err = await geocodeRes.text()
      logger.error('Geocoding API error:', err)
      response.status(500).send({ error: 'Failed to fetch coordinates' })
      return
    }

    const data = await geocodeRes.json()

    if (data.status !== 'OK' || !data.results.length) {
      logger.warn('No results found for address:', address)
      response.status(404).send({ error: 'Address not found' })
      return
    }

    const result = data.results[0]
    const location = result.geometry.location

    response.status(200).send({
      lat: location.lat,
      lng: location.lng,
      formatted_address: result.formatted_address,
      embedUrl: `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`,
    })
  } catch (err) {
    logger.error('Server error:', err)
    response.status(500).send({ error: 'Internal server error' })
  }
})

export const analyzeFile = onRequest(async (req, res) => {
  logger.info('Analyzing uploaded file...')

  const { file } = req.body
  console.log('file', file)
  if (!file || typeof file !== 'string') {
    res.status(400).send({ error: 'Missing or invalid file.' })
    return
  }

  try {
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `
You are a menu parser. Extract structured data from the attached restaurant menu image.

Return valid JSON only in this structure:
{
  "menu": [
    {
      "section": "string",
      "items": [
        {
          "name": "string",
          "price": number,
          "description": "string (optional)"
        }
      ]
    }
  ]
}

Rules:
- ALL CAPS = section name.
- Item = line with name and price (e.g., "French Fries $3.99").
- Description = any lines immediately after the item name until the next item or section.
- If no description exists, omit the field.
- Ignore modifiers and dietary tags.
- Return only the JSON.
`.trim(),
            },
            {
              type: 'image_url',
              image_url: {
                url: file,
              },
            },
          ],
        },
      ],
      max_tokens: 3000, // Allow more room for longer menus
    })

    const content = aiResponse.choices[0].message?.content
    if (content) {
      // parse the JSON string into an object
      console.log('Content', content)
      const parsed = JSON.parse(content)
      // send back native object, not a string
      res.status(200).send({ result: parsed })
      return
    }

    res.status(500).send({ error: 'No content returned from AI.' })
  } catch (err) {
    logger.error('OpenAI request failed', err)
    res.status(500).send({ error: 'Failed to analyze file.' })
  }
})
