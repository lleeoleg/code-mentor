const KEY_PREFIX = 'codementor_profile_';

function getKey(username) {
  return username ? `${KEY_PREFIX}${username}` : null;
}

const SOCIAL_LINKS_DEFAULT = {
  github: '',
  vk: '',
  coursera: '',
  edx: '',
  skype: '',
  telegram: '',
  website: '',
  youtube: '',
};

const DEFAULTS = {
  firstName: '',
  lastName: '',
  shortBio: '',
  aboutMe: '',
  language: 'ru',
  isPrivate: false,
  betaProgram: false,
  avatar: null,
  socialLinks: { ...SOCIAL_LINKS_DEFAULT },
};

export function getProfile(username) {
  const key = getKey(username);
  if (!key) return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULTS };
    const data = JSON.parse(raw);
    const merged = { ...DEFAULTS, ...data };
    if (merged.socialLinks && typeof merged.socialLinks === 'object') {
      merged.socialLinks = { ...SOCIAL_LINKS_DEFAULT, ...merged.socialLinks };
    }
    return merged;
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveProfile(username, data) {
  const key = getKey(username);
  if (!key) return;
  try {
    const current = getProfile(username);
    const next = { ...current, ...data };
    if (data.socialLinks && typeof data.socialLinks === 'object') {
      next.socialLinks = { ...SOCIAL_LINKS_DEFAULT, ...current.socialLinks, ...data.socialLinks };
    }
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { username } }));
  } catch (e) {
    console.warn('Failed to save profile', e);
  }
}
