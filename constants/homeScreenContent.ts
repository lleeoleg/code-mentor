/** Как на frontend/src/pages/Home.jsx — направления и отзывы для главной. */

export type HomeProgramItem = {
  id: string;
  label: string;
  /** Подстрока для фильтра каталога (как ?q= на сайте). */
  searchQuery: string;
  /** Имя иконки MaterialCommunityIcons (@expo/vector-icons). */
  mci: string;
  iconColor: string;
};

export const HOME_PROGRAMS: HomeProgramItem[] = [
  { id: 'python', label: 'Python', searchQuery: 'python', mci: 'language-python', iconColor: '#3776ab' },
  { id: 'data', label: 'Анализ данных', searchQuery: 'data', mci: 'chart-scatter-plot', iconColor: '#0ea5e9' },
  { id: 'qa', label: 'QA и тестирование ПО', searchQuery: 'qa', mci: 'bug-check-outline', iconColor: '#64748b' },
  { id: 'web', label: 'Веб-разработка', searchQuery: 'web', mci: 'react', iconColor: '#61dafb' },
  { id: 'js', label: 'JavaScript', searchQuery: 'javascript', mci: 'language-javascript', iconColor: '#ca8a04' },
  { id: 'sql', label: 'SQL', searchQuery: 'sql', mci: 'database-outline', iconColor: '#0284c7' },
  { id: 'django', label: 'Django', searchQuery: 'django', mci: 'application-brackets', iconColor: '#16a34a' },
  { id: 'csharp', label: 'C# / .NET', searchQuery: 'csharp', mci: 'language-csharp', iconColor: '#7c3aed' },
];

export type HomeReview = {
  id: number;
  name: string;
  course: string;
  courseId: number;
  date: string;
  text: string;
  initials: string;
  color: string;
};

export const HOME_REVIEWS: HomeReview[] = [
  {
    id: 1,
    name: 'Kamilla Sembekova',
    course: 'Power BI: от данных до аналитики',
    courseId: 1,
    date: '28 апреля 2026',
    text:
      'Отличный курс! Очень структурировано и понятно объясняется работа с Power BI. За несколько недель смогла построить свои первые дашборды для работы. Рекомендую всем, кто хочет работать с данными.',
    initials: 'KS',
    color: '#7c3aed',
  },
  {
    id: 2,
    name: 'Nurdaulet Kapyshov',
    course: 'React: Practical Components & State',
    courseId: 6,
    date: '1 мая 2026',
    text:
      'Наконец-то курс по React, где реально учат практике, а не просто теории. Компоненты, хуки, управление состоянием — всё разобрано на живых проектах. После курса сразу взял коммерческий заказ.',
    initials: 'NK',
    color: '#0ea5e9',
  },
  {
    id: 3,
    name: 'Lee Oleg',
    course: 'REST APIs with Django REST Framework',
    courseId: 8,
    date: '3 мая 2026',
    text:
      'Очень полезный курс для бэкенд-разработчиков. Django REST Framework разобран детально: сериализаторы, ViewSets, авторизация по токенам. Всё на реальном проекте — зачёт!',
    initials: 'LO',
    color: '#059669',
  },
  {
    id: 4,
    name: 'Dinmukhamed Kabzhanov',
    course: 'Data Engineering: ETL Pipelines',
    courseId: 12,
    date: '5 мая 2026',
    text:
      'Курс дал чёткое понимание как строить ETL-пайплайны с нуля. Airflow, трансформации данных — всё подробно и на практике. Отличный старт в Data Engineering!',
    initials: 'DK',
    color: '#d97706',
  },
];
