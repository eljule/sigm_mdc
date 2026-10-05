import { User } from '../entities/user.entity';

/**
 * Puerto de repositorio para gestión y autenticación de usuarios.
 */
export abstract class UserRepositoryPort {
  abstract findAll(): Promise<User[]>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
  abstract delete(id: string): Promise<boolean>;
  abstract count(): Promise<number>;
}
