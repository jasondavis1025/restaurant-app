import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { MenuSection } from '../../models/menu.types';
type MenuPeriod = 'morning' | 'late-night';
@Component({
  selector: 'app-menu',
  imports: [CurrencyPipe],
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
  // ['SAVORY EATS', 'SWEET BITES', 'COFFEE / MATCHA', 'COFFEE', 'MATCHA'],
  // readonly menuSections = {
  //   morning: {
  //     title: 'MORNING CAFE MENU',
  //     categories: [
  //       {
  //         name: 'Savory Eats',
  //         items: [
  //           {
  //             id: 1,
  //             name: 'breakfast sandwhich',
  //             description: 'Egg, cheese, and fresh seasonings on a toasted bun.',
  //             price: 9.5,
  //             imageUrl:
  //               'https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488148/comfort_bowl_hgwpsl.png',
  //           },
  //           {
  //             id: 2,
  //             name: 'breakfast taco',
  //             description:
  //               'Cold eggs, dry ass ingredients, soggy tortilla. Made by a crazy Austinite',
  //             price: 9.5,
  //             imageUrl:
  //               'https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488147/breakf_set_ynlqdz.png',
  //           },
  //         ],
  //       },
  //       {
  //         name: 'Sweet Bites',
  //         items: [
  //           {
  //             id: 1,
  //             name: 'breakfast sandwhich',
  //             description: 'Egg, cheese, and fresh seasonings on a toasted bun.',
  //             price: 9.5,
  //             imageUrl:
  //               'https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488146/salmon_salad_ipdbkg.png',
  //           },
  //           {
  //             id: 2,
  //             name: 'regular taco',
  //             description: 'not as good as California tacos',
  //             price: 9.5,
  //             imageUrl:
  //               'https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488145/pad_thao_oqv2xc.png',
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   'late-night': {
  //     title: 'LATE NIGHT MENU',
  //     categories: [
  //       {
  //         name: 'At Nigh ;)',
  //         items: [
  //           {
  //             id: 1,
  //             name: 'Chef Chris Concoctions',
  //             description: 'mystery ingredients.',
  //             price: 9.5,
  //             imageUrl: 'idkMyBFFjill',
  //           },
  //           {
  //             id: 2,
  //             name: 'breakfast taco',
  //             description: 'Made by a crazy Austinite',
  //             price: 9.5,
  //             imageUrl: 'sadderthanmydreams',
  //           },
  //         ],
  //       },
  //       {
  //         name: 'Sweet Bites',
  //         items: [
  //           {
  //             id: 1,
  //             name: 'breakfast sandwhich',
  //             description: 'Egg, cheese, and fresh seasonings on a toasted bun.',
  //             price: 9.5,
  //             imageUrl: 'cloud',
  //           },
  //           {
  //             id: 2,
  //             name: 'regular taco',
  //             description: 'not as good as California tacos',
  //             price: 9.5,
  //             imageUrl: 'missingCAmexicanFood',
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // };

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
