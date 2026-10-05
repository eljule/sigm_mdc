import { Transform } from 'class-transformer';
import { ValueTransformer } from 'typeorm';

/**
 * Decorador para DTOs (class-transformer):
 * Limpia espacios múltiples, recorta extremos y convierte a MAYÚSCULAS.
 * Ej. "  oficina  de desarrollo  " -> "OFICINA DE DESARROLLO"
 */
export function TrimUpper(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim().replace(/\s+/g, ' ').toUpperCase();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  });
}

/**
 * Decorador para DTOs (class-transformer):
 * Limpia espacios y convierte a minúsculas (ideal para emails y usernames).
 * Ej. "  USER@Castilla.gob.pe  " -> "user@castilla.gob.pe"
 * Si la cadena es vacía o solo espacios, retorna undefined para compatibilidad con @IsOptional.
 */
export function TrimLower(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  });
}

/**
 * Decorador para DTOs (class-transformer):
 * Recorta espacios en blanco al inicio y al final, y colapsa espacios dobles
 * manteniendo la capitalización original (ideal para descripciones o notas).
 * Si la cadena es vacía o solo espacios, retorna undefined para compatibilidad con @IsOptional.
 */
export function Trim(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim().replace(/\s+/g, ' ');
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  });
}

/**
 * TypeORM Column Transformer para MAYÚSCULAS:
 * Se ejecuta automáticamente al guardar en la base de datos (INSERT/UPDATE).
 */
export const UpperCaseColumnTransformer: ValueTransformer = {
  to: (value?: string | null) => {
    if (typeof value === 'string') {
      return value.trim().replace(/\s+/g, ' ').toUpperCase();
    }
    return value;
  },
  from: (value?: string | null) => value,
};

/**
 * TypeORM Column Transformer para minúsculas:
 * Se ejecuta automáticamente al guardar emails o usernames en la BD.
 */
export const LowerCaseColumnTransformer: ValueTransformer = {
  to: (value?: string | null) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    return value;
  },
  from: (value?: string | null) => value,
};

/**
 * TypeORM Column Transformer para Trim general:
 */
export const TrimColumnTransformer: ValueTransformer = {
  to: (value?: string | null) => {
    if (typeof value === 'string') {
      return value.trim().replace(/\s+/g, ' ');
    }
    return value;
  },
  from: (value?: string | null) => value,
};
