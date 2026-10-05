import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { PersonRepositoryPort, PersonFilter } from '../../domain/ports/person.repository.port';
import { Person, PersonType } from '../../domain/entities/person.entity';
import { PersonEntity } from '../persistence/entities/person.entity';
import { PersonMapper } from '../persistence/mappers/person.mapper';

@Injectable()
export class TypeOrmPersonRepository implements PersonRepositoryPort {
  constructor(
    @InjectRepository(PersonEntity)
    private readonly ormRepository: Repository<PersonEntity>,
  ) {}

  async findAll(filter?: PersonFilter): Promise<Person[]> {
    const qb = this.ormRepository.createQueryBuilder('person');

    if (filter?.type) {
      qb.andWhere('person.type = :type', { type: filter.type });
    }

    if (filter?.office) {
      qb.andWhere('person.office = :office', { office: filter.office });
    }

    if (filter?.search) {
      const term = `%${filter.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(person.document_number) LIKE :term OR LOWER(person.first_name) LIKE :term OR LOWER(person.paternal_surname) LIKE :term OR LOWER(person.maternal_surname) LIKE :term OR LOWER(person.business_name) LIKE :term)',
        { term },
      );
    }

    qb.orderBy('person.created_at', 'DESC');
    const entities = await qb.getMany();
    return entities.map((e) => PersonMapper.toDomain(e));
  }

  async findById(id: string): Promise<Person | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    if (!entity) return null;
    return PersonMapper.toDomain(entity);
  }

  async findByDocument(documentNumber: string): Promise<Person | null> {
    const entity = await this.ormRepository.findOne({ where: { documentNumber } });
    if (!entity) return null;
    return PersonMapper.toDomain(entity);
  }

  async save(person: Person): Promise<Person> {
    const orm = PersonMapper.toOrm(person);
    const saved = await this.ormRepository.save(orm);
    return PersonMapper.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.ormRepository.delete(id);
    return (res.affected ?? 0) > 0;
  }

  async countByType(type: PersonType): Promise<number> {
    return this.ormRepository.count({ where: { type } });
  }

  async count(): Promise<number> {
    return this.ormRepository.count();
  }
}
