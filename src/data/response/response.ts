export class Response<T> {
  IsSuccess: boolean;
  Status: number;
  Message: string;
  Model: T;

  constructor(success: boolean, status: number, message: string, model: T) {
    this.IsSuccess = success;
    this.Status = status;
    this.Message = message;
    this.Model = model;
  }
}

export class Result<T> {
  Entity: T | null;
  Result: PagedResult<T> | null;

  private constructor(entity: T | null, result: PagedResult<T> | null) {
    this.Entity = entity;
    this.Result = result;
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
  PageIndex: number;
  PageSize: number;
  TotalRecords: number;
  Result: T | null;

  constructor(
    pageindex: number,
    pageSize: number,
    totalRecords: number,
    result: T | null
  ) {
    this.PageIndex = pageindex;
    this.PageSize = pageSize;
    this.TotalRecords = totalRecords;
    this.Result = result;
  }
}
