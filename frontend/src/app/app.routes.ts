import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'menu',
        loadComponent: () => import('./pages/menu/menu').then((m) => m.Menu),
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then((m) => m.About),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/checkout-layout/checkout-layout').then((m) => m.CheckoutLayout),
    children: [
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
      },
      {
        path: 'confirmation',
        loadComponent: () =>
          import('./pages/confirmation/confirmation').then((m) => m.Confirmation),
      },
    ],
  },
];
