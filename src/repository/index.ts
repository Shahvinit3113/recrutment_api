/**
 * Repository Module Exports
 * 
 * This module provides the Generic Repository + Unit of Work pattern.
 * 
 * Key exports:
 * - IRepository<T>: Interface for repository operations
 * - IUnitOfWork: Interface for unit of work
 * - Repository<T>: Generic repository implementation
 * - UnitOfWork: Unit of work implementation
 */

// Interfaces
export type { IRepository } from './interfaces/repository.interface';
export type { IUnitOfWork } from './interfaces/unit-of-work.interface';

// Implementations
export { Repository } from './generic/repository';
export { UnitOfWork } from './unit-of-work/unit-of-work';
