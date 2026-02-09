const KEY_PREFIX = 'codementor_favorites_';

function getKey(username) {
  return username ? `${KEY_PREFIX}${username}` : null;
}

function loadIds(username) {
  try {
    const key = getKey(username);
    if (!key) return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((id) => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
}

function saveIds(username, ids) {
  const key = getKey(username);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(ids));
}

export function getFavoriteIds(username) {
  return loadIds(username);
}

export function isFavorite(username, courseId) {
  return loadIds(username).includes(Number(courseId));
}

export function toggleFavorite(username, courseId) {
  const key = getKey(username);
  if (!key) return [];
  const ids = loadIds(username);
  const id = Number(courseId);
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  saveIds(username, next);
  return next;
}

export function setFavorites(username, ids) {
  const next = ids.map(Number).filter(Number.isInteger);
  saveIds(username, next);
  return next;
}
