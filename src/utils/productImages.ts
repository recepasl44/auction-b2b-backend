import fs from 'fs';
import path from 'path';

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'flour': 'wheat flour orta.png',
  'spaghetti': 'spaghetti ANA.png',
  'fresh egg': 'fresh egg.png',
  'sunflower oil': 'sunflower oil.png',
  'short-cut pasta': 'spaghetti ANA.png',
  'wheat flour': 'wheat flour orta.png'
};

export function findImagesForProduct(name: string): string[] {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) return [];
  const files = fs.readdirSync(uploadsDir);
  const prefix = name.toLowerCase().replace(/\s+/g, ' ').trim();
  const matched = files.filter((f) => f.toLowerCase().startsWith(prefix));
  return matched.map((f) => path.join('uploads', f));
}

export function findImagesForCategory(category: string): string[] {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) return [];
  const files = fs.readdirSync(uploadsDir);
  const prefix = category.toLowerCase().replace(/\s+/g, ' ').trim();
  const matched = files.filter((f) => f.toLowerCase().startsWith(prefix));
  const mapped = CATEGORY_IMAGE_MAP[prefix];
  if (mapped && files.includes(mapped) && !matched.includes(mapped)) {
    matched.push(mapped);
  }
  return Array.from(new Set(matched)).map((f) => path.join('uploads', f));
}
