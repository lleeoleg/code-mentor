export type SocialLinkField = {
  id: string;
  label: string;
  prefix: string;
  placeholder: string;
};

export const SOCIAL_LINK_FIELDS: SocialLinkField[] = [
  { id: 'github', label: 'GitHub', prefix: 'https://github.com/', placeholder: 'username' },
  { id: 'vk', label: 'VK', prefix: 'https://vk.com/', placeholder: 'id' },
  { id: 'coursera', label: 'Coursera', prefix: 'https://www.coursera.org/user/', placeholder: 'id' },
  { id: 'edx', label: 'edX', prefix: 'https://courses.edx.org/u/', placeholder: 'username' },
  { id: 'skype', label: 'Skype ID', prefix: '', placeholder: 'Ваш Skype ID' },
  { id: 'telegram', label: 'Telegram', prefix: 'https://t.me/', placeholder: 'username' },
  { id: 'website', label: 'Сайт', prefix: '', placeholder: 'https://...' },
  { id: 'youtube', label: 'YouTube', prefix: '', placeholder: 'Ссылка на канал или @handle' },
];
