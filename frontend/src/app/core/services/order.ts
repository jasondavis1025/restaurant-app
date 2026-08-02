import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import type { CreatedOrder, CreateOrderRequest } from '../../models/order.types';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Service()
export class OrderService {
  private readonly http = inject(HttpClient);

  createOrder(input: CreateOrderRequest): Observable<CreatedOrder> {
    return this.http.post<CreatedOrder>(`${environment.apiUrl}/orders`, input, {
      withCredentials: true,
    });
  }
}
