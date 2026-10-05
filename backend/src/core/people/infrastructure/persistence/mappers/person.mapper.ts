import { Person, PersonType, DocumentType } from '../../../domain/entities/person.entity';
import { PersonEntity } from '../entities/person.entity';

export class PersonMapper {
  static toDomain(orm: PersonEntity): Person {
    return new Person({
      id: orm.id,
      type: orm.type as PersonType,
      documentType: orm.documentType as DocumentType,
      documentNumber: orm.documentNumber,
      firstName: orm.firstName,
      paternalSurname: orm.paternalSurname,
      maternalSurname: orm.maternalSurname || '',
      email: orm.email,
      phone: orm.phone,
      address: orm.address,
      position: orm.position,
      office: orm.office,
      laborCondition: orm.laborCondition,
      entryDate: orm.entryDate,
      departureDate: orm.departureDate,
      cessationReason: orm.cessationReason,
      laborStatus: (orm.laborStatus as any) || 'ACTIVO',
      businessName: orm.businessName,
      allowsOnlineAccess: orm.allowsOnlineAccess,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: Person): PersonEntity {
    const orm = new PersonEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.type = domain.type;
    orm.documentType = domain.documentType;
    orm.documentNumber = domain.documentNumber;
    orm.firstName = domain.firstName;
    orm.paternalSurname = domain.paternalSurname;
    orm.maternalSurname = domain.maternalSurname;
    orm.email = domain.email;
    orm.phone = domain.phone;
    orm.address = domain.address;
    orm.position = domain.position;
    orm.office = domain.office;
    orm.laborCondition = domain.laborCondition;
    orm.entryDate = domain.entryDate;
    orm.departureDate = domain.departureDate;
    orm.cessationReason = domain.cessationReason;
    orm.laborStatus = domain.laborStatus;
    orm.businessName = domain.businessName;
    orm.allowsOnlineAccess = domain.allowsOnlineAccess;
    orm.isActive = domain.isActive;
    return orm;
  }
}
