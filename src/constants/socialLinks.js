/** Поля ссылок на соцсети: id, label, prefix (базовый URL или подпись), placeholder */
export const SOCIAL_LINK_FIELDS = [
  { id: 'github', label: 'GitHub', prefix: 'https://github.com/', placeholder: 'username' },
  { id: 'linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/in/', placeholder: 'username' },
  { id: 'telegram', label: 'Telegram', prefix: 'https://t.me/', placeholder: 'username' },
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
