import { Component, computed, inject, signal } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { MenuSection } from '../../models/menu.types';
import { MenuItem } from './menu-item/menu-item';
type MenuPeriod = 'morning' | 'late-night';
@Component({
  selector: 'app-menu',
  imports: [MenuItem],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
// https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_600/v1784490235/copy_of_storefront_quqwco.png
export class Menu {
  private readonly menuService = inject(MenuService);
  readonly activeMenu = signal<MenuPeriod>('morning');

  menuSections = signal<MenuSection[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeMenuSection = computed(() =>
    this.menuSections().find((menu) => menu.slug === this.activeMenu()),
  );

  constructor() {
    this.loadMenu();
  }
  private loadMenu(): void {
    this.menuService.getMenu().subscribe({
      next: (menus) => {
        this.menuSections.set(menus);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load menu:', error);
        this.error.set('Unable to load the menu.');
        this.loading.set(false);
      },
    });
  }

  selectMenu(menu: MenuPeriod): void {
    this.activeMenu.set(menu);
  }
}
