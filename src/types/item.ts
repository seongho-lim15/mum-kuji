export class AddCategoryRequest {
  name: string = "";
  price: number = 0;
  category: string = "";
}

export class Category {
  id: string = "";
  name: string = "";
  price: number = 0;
  category: string = "";
}

export class AddCategoryResponse {
  items: Category[] = [];
  message: string = "";
}
