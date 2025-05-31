export function fileUrl(reqProtocol: string, host: string, filePath: string): string {
  const base = process.env.BASE_URL || `${reqProtocol}://${host}`;
  if (!filePath) return '';
  const clean = filePath.replace(/\\/g, '/');
  return `${base}/${clean}`;
}