import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mimeTypes: Record<string, string> = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const filePath = req.url?.replace(/^\/?assets\//, '') || '';
    const fullPath = resolve(process.cwd(), 'dist/public/assets', filePath);
    
    // Security: prevent directory traversal
    if (!fullPath.startsWith(resolve(process.cwd(), 'dist/public/assets'))) {
      res.status(403).send('Forbidden');
      return;
    }
    
    const file = readFileSync(fullPath);
    const ext = filePath.substring(filePath.lastIndexOf('.'));
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(file);
  } catch (error) {
    console.error('Error serving asset:', error);
    res.status(404).send('Not Found');
  }
}
