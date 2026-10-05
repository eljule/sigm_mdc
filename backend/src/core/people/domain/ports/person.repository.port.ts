import { Person, PersonType } from '../entities/person.entity';

export interface PersonFilter {
  type?: PersonType;
  search?: string;
  office?: string;
}

export abstract class PersonRepositoryPort {
  abstract findAll(filter?: PersonFilter): Promise<Person[]>;
  abstract findById(id: string): Promise<Person | null>;
  abstract findByDocument(documentNumber: string): Promise<Person | null>;
  abstract save(person: Person): Promise<Person>;
  abstract delete(id: string): Promise<boolean>;
  abstract countByType(type: PersonType): Promise<number>;
  abstract count(): Promise<number>;
}
