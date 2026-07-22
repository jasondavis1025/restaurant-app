export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  itemType: string;
  basePrice: number;
  imageUrl: string | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuSection {
  id: string;
  name: string;
  slug: string;
  startTime: string;
  endTime: string;
  allowsPreorder: boolean;
  orderAheadDays: number;
  categories: MenuCategory[];
}
