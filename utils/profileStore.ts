import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'codementor_profile_';

function getKey(username: string | undefined | null): string | null {
  return username ? `${KEY_PREFIX}${username}` : null;
}

const SOCIAL_LINKS_DEFAULT: Record<string, string> = {
  github: '',
  vk: '',
  coursera: '',
  edx: '',
  skype: '',
  telegram: '',
  website: '',
  youtube: '',
};

export type Profile = {
  firstName: string;
  lastName: string;
  shortBio: string;
  aboutMe: string;
  language: string;
  isPrivate: boolean;
  betaProgram: boolean;
  avatar: string | null;
  socialLinks: Record<string, string>;
};

const DEFAULTS: Profile = {
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

export async function getProfile(username: string | undefined | null): Promise<Profile> {
  const key = getKey(username);
  if (!key) return { ...DEFAULTS };
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return { ...DEFAULTS };
    const data = JSON.parse(raw) as Partial<Profile>;
    const merged: Profile = { ...DEFAULTS, ...data };
    if (merged.socialLinks && typeof merged.socialLinks === 'object') {
      merged.socialLinks = { ...SOCIAL_LINKS_DEFAULT, ...merged.socialLinks };
    }
    return merged;
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveProfile(
  username: string | undefined | null,
  data: Partial<Profile>
): Promise<void> {
  const key = getKey(username);
  if (!key) return;
  try {
    const current = await getProfile(username);
    const next: Profile = { ...current, ...data };
    if (data.socialLinks && typeof data.socialLinks === 'object') {
      next.socialLinks = { ...SOCIAL_LINKS_DEFAULT, ...current.socialLinks, ...data.socialLinks };
    }
    await AsyncStorage.setItem(key, JSON.stringify(next));
  } catch (e) {
    console.warn('Failed to save profile', e);
  }
}
