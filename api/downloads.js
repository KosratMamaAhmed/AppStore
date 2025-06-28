import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // ڕێگەدان بە داواکاری لە هەموو دۆمەینێکەوە. بۆ پاراستنی زیاتر، دەتوانیت ناوی دۆمەینی خۆت بنووسیت.
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // وەڵامدانەوەی داواکاری OPTIONS بۆ CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // وەرگرتنی ژمارەی داگرتن
    if (req.method === 'GET') {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'App ID is required' });
        }
        try {
            // وەرگرتنی ژمارەکە لە KV. ئەگەر بوونی نەبوو، سفر دادەنێت.
            const count = await kv.get(`downloads:${id}`) || 0;
            return res.status(200).json({ count });
        } catch (error) {
            console.error('KV GET Error:', error);
            return res.status(500).json({ message: 'Error fetching download count' });
        }
    }

    // زیادکردنی ژمارەی داگرتن
    if (req.method === 'POST') {
        try {
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ message: 'App ID is required' });
            }
            // زیادکردنی ژمارەکە بە یەک
            const newCount = await kv.incr(`downloads:${id}`);
            return res.status(200).json({ newCount });
        } catch (error) {
            console.error('KV INCR Error:', error);
            return res.status(500).json({ message: 'Error updating download count' });
        }
    }
    
    // ئەگەر methodـەکە جیاواز بوو
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}