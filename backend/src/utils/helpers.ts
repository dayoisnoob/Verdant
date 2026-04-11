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

export const formatNigerianPhoneNumber = (
  phoneNumber: string | undefined
): string => {
  if (!phoneNumber) return '';

  const trimmed = phoneNumber.trim();
  if (trimmed.startsWith('0')) return '+234 ' + trimmed.slice(1);
  if (trimmed.startsWith('234')) return '+' + trimmed;
  if (trimmed.startsWith('+234')) return trimmed;
  return '+234 ' + trimmed;
};
