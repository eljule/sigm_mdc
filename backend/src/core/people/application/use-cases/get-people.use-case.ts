import { Injectable } from '@nestjs/common';
import { PersonRepositoryPort, PersonFilter } from '../../domain/ports/person.repository.port';
import { PersonResponseDto } from '../dtos/person-response.dto';

export interface PeopleListResult {
  items: PersonResponseDto[];
  counts: {
    total: number;
    personal: number;
    administrados: number;
  };
}

@Injectable()
export class GetPeopleUseCase {
  constructor(private readonly personRepository: PersonRepositoryPort) {}

  async execute(filter?: PersonFilter): Promise<PeopleListResult> {
    const people = await this.personRepository.findAll(filter);
    const [total, personal, administrados] = await Promise.all([
      this.personRepository.count(),
      this.personRepository.countByType('PERSONAL'),
      this.personRepository.countByType('ADMINISTRADO'),
    ]);

    return {
      items: people.map((p) => PersonResponseDto.fromDomain(p)),
      counts: {
        total,
        personal,
        administrados,
      },
    };
  }
}
