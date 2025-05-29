export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidInstagram = (username: string): boolean => {
  const instagramRegex = /^@?[a-zA-Z0-9._]{1,30}$/;
  return instagramRegex.test(username);
};

export const isValidDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const isValidPrice = (price: number): boolean => {
  return price >= 0 && Number.isFinite(price);
};

export const isValidDuration = (duration: number): boolean => {
  return duration > 0 && Number.isInteger(duration);
};
