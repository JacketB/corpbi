import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  public themeService = inject(ThemeService);
  private translocoService = inject(TranslocoService);
  activeLang = signal<string>(this.translocoService.getActiveLang());

  toggleLanguage() {
    const nextLang = this.activeLang() === 'ru' ? 'en' : 'ru';
    this.translocoService.setActiveLang(nextLang);
    this.activeLang.set(nextLang);
  }
}