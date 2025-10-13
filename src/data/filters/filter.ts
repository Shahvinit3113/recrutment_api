type OrderBy = "ASC" | "DESC";

export class Filter {
  Query: string;
  PageIndex: number;
  PageSize: number;
  Date: Date;
  OrderBy: OrderBy;
}
