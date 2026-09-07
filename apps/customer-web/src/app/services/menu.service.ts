import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '@angular/core';

import { MenuSection } from '../models/menu.types';
import { environment } from '../environments/environment';

@Service()
export class MenuService {
  private readonly http = inject(HttpClient);

  getMenu(): Observable<MenuSection[]> {
    return this.http.get<MenuSection[]>(`${environment.apiUrl}/menu`);
  }
}
