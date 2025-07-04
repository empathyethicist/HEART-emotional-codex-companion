import { nanoid } from "nanoid";

export function generateEmid(emotionFamily: string): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const shortId = nanoid(6).toLowerCase();
  
  // Format: USR009-EMOTION-TIMESTAMP-ID
  return `USR009-${emotionFamily.toUpperCase()}-${timestamp}Z-${shortId}`;
}
