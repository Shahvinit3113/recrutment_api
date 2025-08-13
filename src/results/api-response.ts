export class Response<T> {
  isSuccess: boolean;
  status: number;
  message: string;
  model: T;

  constructor(success: boolean, status: number, message: string, model: T) {
    this.isSuccess = success;
    this.status = status;
    this.message = message;
    this.model = model;
  }
}

export class Result<T> {
  entity: T | null;
  result: PagedResult<T> | null;

  private constructor(entity: T | null, result: PagedResult<T> | null) {
    this.entity = entity;
    this.result = result;
  }

  static toEntityResult<T>(entity: T): Result<T> {
    return new Result<T>(entity, null);
  }

  static toPagedResult<T>(
    pageIndex: number,
    pageSize: number,
    totalRecords: number,
    result: T | null = null
  ): Result<T> {
    return new Result<T>(
      null,
      new PagedResult<T>(pageIndex, pageSize, totalRecords, result)
    );
  }
}

export class PagedResult<T> {
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  result: T | null;

  constructor(
    pageindex: number,
    pageSize: number,
    totalRecords: number,
    result: T | null
  ) {
    this.pageIndex = pageindex;
    this.pageSize = pageSize;
    this.totalRecords = totalRecords;
    this.result = result;
  }
}
