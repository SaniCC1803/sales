import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const changeTheme = (colorName: string) => {
  colors
    .filter((col) => col.name !== colorName)
    .forEach((col) => {
      if (col.class) document.documentElement.classList.remove(col.class);
    });

  if (colorName) {
    document.documentElement.classList.add(colorName);
    // Save the selected theme to localStorage
    localStorage.setItem('selected-color-theme', colorName);
  }
};

export const restoreTheme = () => {
  const savedTheme = localStorage.getItem('selected-color-theme');
  if (savedTheme) {
    const themeExists = colors.find((c) => c.name === savedTheme);
    if (themeExists) {
      changeTheme(savedTheme);
    }
  }
};

export const colors = [
  { name: 'default', class: 'default', primary: 'oklch(0.205 0 0)' },
  { name: 'red', class: 'red', primary: 'oklch(0.637 0.237 25.331)' },
  { name: 'rose', class: 'rose', primary: 'oklch(0.645 0.246 16.439)' },
  { name: 'orange', class: 'orange', primary: 'oklch(0.705 0.213 47.604)' },
  { name: 'green', class: 'green', primary: 'oklch(0.723 0.219 149.579)' },
  { name: 'blue', class: 'blue', primary: 'oklch(0.623 0.214 259.815)' },
  { name: 'yellow', class: 'yellow', primary: 'oklch(0.795 0.184 86.047)' },
  { name: 'violet', class: 'violet', primary: 'oklch(0.606 0.25 292.717)' },
];
