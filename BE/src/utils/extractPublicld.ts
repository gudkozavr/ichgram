// Функция для извлечения public_id из URL (если структура URL стандартная)
export function extractPublicId(url: string): string | null {
  const regex = /\/v[0-9]+\/(.+?)\./;
  const match = url.match(regex);
  return match ? match[1] : null;
}
