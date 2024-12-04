export const formatDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString();
};