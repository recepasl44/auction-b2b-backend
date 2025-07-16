import fs from 'fs';
import path from 'path';

export function findImagesForProduct(name: string): string[] {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) return [];
  const files = fs.readdirSync(uploadsDir);
  const prefix = name.toLowerCase().replace(/\s+/g, ' ').trim();
  const matched = files.filter((f) => f.toLowerCase().startsWith(prefix));
  return matched.map((f) => path.join('uploads', f));
}
