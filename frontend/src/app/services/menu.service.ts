import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '@angular/core';

import { MenuSection } from '../models/menu.types';

@Service()
export class MenuService {
  private readonly http = inject(HttpClient);
  getMenu(): Observable<MenuSection[]> {
    return this.http.get<MenuSection[]>('http://localhost:3000/api/menu');
  }
}
