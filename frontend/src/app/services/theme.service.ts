import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly currentTheme = signal<'light' | 'dark'>('dark');

  constructor() {
    const savedTheme = localStorage.getItem('stg-theme') as 'light' | 'dark';
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('dark');
    }
  }

  toggleTheme() {
    const nextTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  private setTheme(theme: 'light' | 'dark') {
    this.currentTheme.set(theme);
    localStorage.setItem('stg-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}