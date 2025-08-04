import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function userInitials(name: string) {
  // return first and last name initials. if name is only one word, return the first letter
  const firstLetters = name.split(' ').map((part) => part.trim()[0]);
  if (firstLetters.length === 1) {
    return firstLetters[0];
  }
  return firstLetters[0] + firstLetters[firstLetters.length - 1];
}
