import { Component, inject, signal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { OrderService } from "./services/order";
import { Order } from "./models/order";

@Component({
  imports: [RouterModule],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  protected title = "kitchen-desktop";
  readonly platform = window.electronAPI?.platform ?? "browser";

  constructor() {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
      },
      error: () => {
        this.error.set("Unable to load kitchen orders.");
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}
