import { put } from '@vercel/blob';

const PASSWORD = process.env.ADMIN_PASSWORD || 'rsl2024admin';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-password, x-filename');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const password = req.headers['x-password'];
  if (password !== PASSWORD) return res.status(401).json({ error: 'Senha incorreta' });

  const filename = req.headers['x-filename'] || `dep-${Date.now()}.jpg`;

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const blob = await put(`testimonials/${filename}`, buffer, {
      access: 'public',
      addRandomSuffix: true
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
