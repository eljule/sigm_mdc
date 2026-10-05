import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonRepositoryPort } from '../../domain/ports/person.repository.port';
import { UserEntity } from '../../../auth/infrastructure/persistence/entities/user.entity';
import { UpdatePersonDto } from '../dtos/update-person.dto';
import { PersonResponseDto } from '../dtos/person-response.dto';

@Injectable()
export class UpdatePersonUseCase {
  constructor(
    private readonly personRepository: PersonRepositoryPort,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(id: string, dto: UpdatePersonDto): Promise<PersonResponseDto> {
    const person = await this.personRepository.findById(id);
    if (!person) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    // Si se modifica el número de documento, verificar que no colisione con otra persona
    if (dto.documentNumber && dto.documentNumber.trim() !== person.documentNumber) {
      const existing = await this.personRepository.findByDocument(dto.documentNumber.trim());
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe otra persona registrada con el documento ${dto.documentNumber} (${existing.fullName})`,
        );
      }
    }

    // Actualizar campos en la entidad de dominio
    person.update({
      type: dto.type,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber ? dto.documentNumber.trim() : undefined,
      firstName: dto.firstName ? dto.firstName.trim() : undefined,
      paternalSurname: dto.paternalSurname ? dto.paternalSurname.trim() : undefined,
      maternalSurname: dto.maternalSurname !== undefined ? (dto.maternalSurname?.trim() || '') : undefined,
      email: dto.email !== undefined ? (dto.email?.trim() || null) : undefined,
      phone: dto.phone !== undefined ? (dto.phone?.trim() || null) : undefined,
      address: dto.address !== undefined ? (dto.address?.trim() || null) : undefined,
      position: dto.position !== undefined ? (dto.position?.trim() || null) : undefined,
      office: dto.office !== undefined ? (dto.office?.trim() || null) : undefined,
      laborCondition: dto.laborCondition !== undefined ? (dto.laborCondition?.trim() || null) : undefined,
      entryDate: dto.entryDate !== undefined ? (dto.entryDate || null) : undefined,
      businessName: dto.businessName !== undefined ? (dto.businessName?.trim() || null) : undefined,
      allowsOnlineAccess: dto.allowsOnlineAccess,
      isActive: dto.isActive,
    });

    const saved = await this.personRepository.save(person);

    // Sincronizar usuario vinculado si existe
    try {
      const linkedUser = await this.userRepository.findOne({
        where: { personId: saved.id },
      });
      if (linkedUser) {
        linkedUser.fullName = saved.fullName;
        if (saved.email) {
          linkedUser.email = saved.email;
        }
        await this.userRepository.save(linkedUser);
      }
    } catch (e) {
      // Ignorar o registrar error en sincronización de usuario
    }

    return PersonResponseDto.fromDomain(saved);
  }
}
