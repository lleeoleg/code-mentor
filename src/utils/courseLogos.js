function norm(s) {
  return String(s || '').toLowerCase();
}

/**
 * Возвращает логотип для курса по ключевым словам в названии.
 * Логотипы лежат в `frontend/public/images/` и доступны по `/images/...`.
 */
export function getCourseLogo(course) {
  const title = norm(course?.title);
  const desc = norm(course?.description);
  const hay = `${title} ${desc}`.trim();

  // Сначала самые специфичные
  if (hay.includes('power bi') || hay.includes('powerbi')) return { src: '/images/powerbi.svg', alt: 'Power BI' };
  if (hay.includes('git') && !hay.includes('github')) return { src: '/images/git.svg', alt: 'Git' };
  if (hay.includes('html') || hay.includes('css fundamentals') || hay.includes('html & css') || hay.includes('html and css')) return { src: '/images/html.svg', alt: 'HTML & CSS' };
  if (hay.includes('django') || hay.includes('drf') || hay.includes('rest framework')) return { src: '/images/django.svg', alt: 'Django' };
  if (hay.includes('react')) return { src: '/images/react.svg', alt: 'React' };
  if (hay.includes('javascript') || hay.includes('js ') || hay.endsWith(' js') || hay.includes(' js')) return { src: '/images/javascript.svg', alt: 'JavaScript' };
  if (hay.includes('typescript') || hay.includes('ts ')) return { src: '/images/typescript.svg', alt: 'TypeScript' };
  if (hay.includes('python')) return { src: '/images/python.svg', alt: 'Python' };
  if (hay.includes('java ' ) || hay.endsWith(' java') || hay.includes(' java')) return { src: '/images/java.svg', alt: 'Java' };
  if (hay.includes('c#') || hay.includes('csharp') || hay.includes('c sharp') || hay.includes('.net') || hay.includes('dotnet')) return { src: '/images/csharp.svg', alt: 'C#' };
  if (hay.includes('sql') || hay.includes('postgres') || hay.includes('mysql')) return { src: '/images/sql.svg', alt: 'SQL' };
  if (hay.includes('flutter') || hay.includes('dart')) return { src: '/images/flutter.svg', alt: 'Flutter' };
  if (hay.includes('docker') || hay.includes('devops') || hay.includes('ci/cd') || hay.includes('kubernetes') || hay.includes('container')) return { src: '/images/docker.svg', alt: 'Docker' };
  if (hay.includes('qa') || hay.includes('manual testing') || hay.includes('тестирован')) return { src: '/images/qa.svg', alt: 'QA' };
  if (hay.includes('security') || hay.includes('owasp') || hay.includes('secure')) return { src: '/images/security.svg', alt: 'Security' };
  if (hay.includes('api') || hay.includes('rest')) return { src: '/images/api.svg', alt: 'API' };
  if (hay.includes('data') || hay.includes('etl') || hay.includes('analytics') || hay.includes('analysis') || hay.includes('анализ')) return { src: '/images/data.svg', alt: 'Data' };

  return null;
}

