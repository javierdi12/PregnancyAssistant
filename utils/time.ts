import { Timestamp } from 'firebase/firestore';

export const timeAgo = (timestamp: Timestamp): string => {
  if (!timestamp) {
    return '';
  }
  const now = new Date();
  const past = timestamp.toDate();
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const seconds = diffInSeconds;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `hace ${years} año${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  }
  if (days > 0) {
    return `hace ${days} día${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
  if (seconds < 10) {
    return 'justo ahora';
  }
  return `hace ${seconds} segundo${seconds > 1 ? 's' : ''}`;
};
