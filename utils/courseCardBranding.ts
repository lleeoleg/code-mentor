/**
 * Две строки для синего бейджа на карточке (как Flutter / Dart в макете).
 */
export function getCourseCardBadgeLines(course: { title?: string; description?: string }): {
  line1: string;
  line2: string;
} {
  const title = String(course?.title || '').trim();
  if (!title) return { line1: '·', line2: '' };

  const byColon = title
    .split(':')
    .map((s) => s.trim())
    .filter(Boolean);
  if (byColon.length >= 2) {
    return {
      line1: byColon[0].slice(0, 16),
      line2: byColon[1].slice(0, 20),
    };
  }

  const words = title.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return {
      line1: words[0].slice(0, 14),
      line2: words.slice(1, 4).join(' ').slice(0, 22),
    };
  }

  return { line1: title.slice(0, 14), line2: '' };
}
