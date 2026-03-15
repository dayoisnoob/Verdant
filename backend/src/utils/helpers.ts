import { nanoid } from 'nanoid';

export const skuGenerator = (name: string, category: string) => {
  return `NOVA-${name.slice(0, 2).toUpperCase()}-${category.slice(0, 3).toUpperCase()}-${nanoid(6)}`;
};

export const generateOrderNumber = () => {
  return `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
};

export const getWindows = (period: number) => {
  const now = new Date();

  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - period);

  const previousStart = new Date(now);
  previousStart.setDate(now.getDate() - period * 2);

  return {
    current: { start: currentStart, end: now },
    previous: { start: previousStart, end: currentStart },
  };
};

export const tokenExpiry = (token: 'refresh' | 'temp') => {
  return token === 'refresh'
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 60 * 60 * 1000);
};
