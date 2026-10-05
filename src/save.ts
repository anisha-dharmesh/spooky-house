import { Lang } from './i18n';

interface LevelResult {
  stars: number;
  best: number; // best time in seconds
}
interface SaveData {
  lang: Lang;
  levels: Record<string, LevelResult>;
}

const KEY = 'spooky-house-save-v1';
let data: SaveData = { lang: 'en', levels: {} };

try {
  const raw = localStorage.getItem(KEY);
  if (raw) data = { ...data, ...JSON.parse(raw) };
} catch {
  /* private mode or blocked storage: play without saving */
}

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export const getSavedLang = (): Lang => data.lang;
export function saveLang(lang: Lang): void {
  data.lang = lang;
  persist();
}

export const getResult = (id: number): LevelResult | undefined => data.levels[String(id)];
export const isCompleted = (id: number): boolean => !!data.levels[String(id)];

export function recordResult(id: number, stars: number, time: number): void {
  const old = data.levels[String(id)];
  data.levels[String(id)] = {
    stars: Math.max(stars, old?.stars ?? 0),
    best: old ? Math.min(old.best, time) : time,
  };
  persist();
}

export const totalStars = (): number => Object.values(data.levels).reduce((n, r) => n + r.stars, 0);
export const hasProgress = (): boolean => Object.keys(data.levels).length > 0;
