import { Person, PersonType, DocumentType } from '../../domain/entities/person.entity';

export class PersonResponseDto {
  id!: string;
  type!: PersonType;
  documentType!: DocumentType;
  documentNumber!: string;
  firstName!: string;
  paternalSurname!: string;
  maternalSurname!: string;
  fullName!: string;
  email!: string | null;
  phone!: string | null;
  address!: string | null;

  position!: string | null;
  office!: string | null;
  laborCondition!: string | null;
  entryDate!: string | null;
  departureDate!: string | null;
  cessationReason!: string | null;
  laborStatus!: string;

  businessName!: string | null;
  allowsOnlineAccess!: boolean;
  isActive!: boolean;

  static fromDomain(entity: Person): PersonResponseDto {
    const dto = new PersonResponseDto();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.documentType = entity.documentType;
    dto.documentNumber = entity.documentNumber;
    dto.firstName = entity.firstName;
    dto.paternalSurname = entity.paternalSurname;
    dto.maternalSurname = entity.maternalSurname;
    dto.fullName = entity.fullName;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.address = entity.address;

    dto.position = entity.position;
    dto.office = entity.office;
    dto.laborCondition = entity.laborCondition;
    dto.entryDate = entity.entryDate;
    dto.departureDate = entity.departureDate;
    dto.cessationReason = entity.cessationReason;
    dto.laborStatus = entity.laborStatus;

    dto.businessName = entity.businessName;
    dto.allowsOnlineAccess = entity.allowsOnlineAccess;
    dto.isActive = entity.isActive;
    return dto;
  }
}
