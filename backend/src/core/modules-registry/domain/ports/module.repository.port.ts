import { Module } from '../entities/module.entity';

/**
 * Puerto de repositorio (Contrato de salida en Arquitectura Hexagonal).
 * Define las operaciones abstractas para la gestión de módulos sin acoplamiento a TypeORM.
 */
export abstract class ModuleRepositoryPort {
  /**
   * Obtiene todos los módulos activos ordenados por prioridad/orden ascendente.
   */
  abstract findAllActive(): Promise<Module[]>;

  /**
   * Busca un módulo por su código único de identificación.
   */
  abstract findByCode(code: string): Promise<Module | null>;

  /**
   * Persiste o actualiza un módulo.
   */
  abstract save(module: Module): Promise<Module>;

  /**
   * Persiste una lista de módulos en lote (útil para seeders o sincronizaciones).
   */
  abstract saveMany(modules: Module[]): Promise<void>;

  /**
   * Cuenta la cantidad total de módulos registrados.
   */
  abstract count(): Promise<number>;
}
