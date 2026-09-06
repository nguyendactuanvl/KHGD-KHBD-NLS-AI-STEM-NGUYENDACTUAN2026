import { HistoryItem } from "../types";

const HISTORY_KEY = "eduplan_history";

export const getHistory = (): HistoryItem[] => {
  const data = localStorage.getItem(HISTORY_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveToHistory = (item: Omit<HistoryItem, "id" | "createdAt">) => {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    createdAt: Date.now()
  };
  history.unshift(newItem);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return newItem;
};

export const deleteFromHistory = (id: string) => {
  const history = getHistory();
  const newHistory = history.filter(h => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};
