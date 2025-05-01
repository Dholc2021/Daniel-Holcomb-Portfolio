// api/chat.js
import Cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

const cors = Cors({ methods: ['POST'] });

export default async function handler(req, res) {
  await new Promise((resolve, reject) => {
    cors(req, res, err => err ? reject(err) : resolve());
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  const hotel = process.env.HOTEL_ADDRESS;
  const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  }));

  try {
    const chat = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are the Concierge Bot for a hotel at ${hotel}. ` +
                   `Only list venues within 5 miles of that address.`
        },
        { role: 'user', content: message }
      ]
    });
    res.status(200).json({ reply: chat.data.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI service failed' });
  }
}
