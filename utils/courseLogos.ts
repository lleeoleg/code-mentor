function norm(s: unknown) {
  return String(s || '').toLowerCase();
}

function svgDataUri(bg: string, fg: string, text: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
<rect x="8" y="8" width="80" height="80" rx="18" fill="${bg}"/>
<text x="48" y="58" font-family="Arial, Helvetica, sans-serif" font-size="${text.length > 3 ? 26 : 34}" font-weight="700" text-anchor="middle" fill="${fg}">${text}</text>
</svg>`;
  // encodeURIComponent is enough for inline svg
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getCourseLogoSource(course: { title?: string; description?: string } | null | undefined) {
  const title = norm(course?.title);
  const desc = norm(course?.description);
  const hay = `${title} ${desc}`.trim();

  if (hay.includes('power bi') || hay.includes('powerbi')) return { uri: svgDataUri('#f59e0b', '#111827', 'PBI') };
  if (hay.includes('django') || hay.includes('drf') || hay.includes('rest framework')) return { uri: svgDataUri('#16a34a', '#ffffff', 'DJ') };
  if (hay.includes('react')) return { uri: svgDataUri('#0f172a', '#38bdf8', 'RE') };
  if (hay.includes('typescript') || hay.includes(' ts') || hay.includes('ts ')) return { uri: svgDataUri('#2563eb', '#ffffff', 'TS') };
  if (hay.includes('javascript') || hay.includes(' js') || hay.includes('js ')) return { uri: svgDataUri('#fbbf24', '#111827', 'JS') };
  if (hay.includes('python')) return { uri: svgDataUri('#2563eb', '#ffffff', 'Py') };
  if (hay.includes('c#') || hay.includes('csharp') || hay.includes('c sharp') || hay.includes('.net') || hay.includes('dotnet'))
    return { uri: svgDataUri('#7c3aed', '#ffffff', 'C#') };
  if (hay.includes(' java') || hay.includes('java ')) return { uri: svgDataUri('#ef4444', '#ffffff', 'Java') };
  if (hay.includes('sql') || hay.includes('postgres') || hay.includes('mysql')) return { uri: svgDataUri('#0ea5e9', '#ffffff', 'SQL') };
  if (hay.includes('qa') || hay.includes('manual testing') || hay.includes('тестирован')) return { uri: svgDataUri('#64748b', '#ffffff', 'QA') };
  if (hay.includes('security') || hay.includes('owasp') || hay.includes('secure')) return { uri: svgDataUri('#111827', '#f87171', 'SEC') };
  if (hay.includes('api') || hay.includes('rest')) return { uri: svgDataUri('#1f2937', '#ffffff', 'API') };
  if (hay.includes('data') || hay.includes('etl') || hay.includes('analytics') || hay.includes('analysis') || hay.includes('анализ'))
    return { uri: svgDataUri('#0ea5e9', '#ffffff', 'DATA') };

  return null;
}

