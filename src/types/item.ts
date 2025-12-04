import { Item } from "@/services/dataService";

export class AddCategoryRequest {
  name: string = "";
  price: number = 0;
  category: string = "";
}

export class AddCategoryResponse {
  items: Item[] = [];
  message: string = "";
}
