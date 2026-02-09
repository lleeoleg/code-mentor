/** Поля ссылок на соцсети: id, label, prefix (базовый URL или подпись), placeholder */
export const SOCIAL_LINK_FIELDS = [
  { id: 'github', label: 'GitHub', prefix: 'https://github.com/', placeholder: 'username' },
  { id: 'vk', label: 'VK', prefix: 'https://vk.com/', placeholder: 'id' },
  { id: 'coursera', label: 'Coursera', prefix: 'https://www.coursera.org/user/', placeholder: 'id' },
  { id: 'edx', label: 'edX', prefix: 'https://courses.edx.org/u/', placeholder: 'username' },
  { id: 'skype', label: 'Skype ID', prefix: '', placeholder: 'Ваш Skype ID' },
  { id: 'telegram', label: 'Telegram', prefix: 'https://t.me/', placeholder: 'username' },
  { id: 'website', label: 'Сайт', prefix: '', placeholder: 'https://...' },
  { id: 'youtube', label: 'YouTube', prefix: '', placeholder: 'Ссылка на канал или @handle' },
];

/**
 * Возвращает полный URL для отображения/перехода.
 * @param {{ id: string, prefix: string }} field
 * @param {string} value
 */
export function getSocialLinkUrl(field, value) {
  const v = (value || '').trim();
  if (!v) return '';
  if (field.prefix) {
    return v.startsWith('http') ? v : field.prefix + v.replace(/^\/*/, '');
  }
  if (field.id === 'skype') return 'skype:' + v + '?chat';
  return v.startsWith('http') ? v : 'https://' + v;
}
