export interface IRepository<T> {
  getById(id: string): Promise<T | null>;
  create(data: T): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
