import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { GetPeopleUseCase, PeopleListResult } from '../../application/use-cases/get-people.use-case';
import { CreatePersonUseCase } from '../../application/use-cases/create-person.use-case';
import { UpdatePersonUseCase } from '../../application/use-cases/update-person.use-case';
import { CeasePersonUseCase } from '../../application/use-cases/cease-person.use-case';
import { CreatePersonDto } from '../../application/dtos/create-person.dto';
import { UpdatePersonDto } from '../../application/dtos/update-person.dto';
import { PersonResponseDto } from '../../application/dtos/person-response.dto';
import {
  CeasePersonDto,
  PersonCessationInfoItem,
  CeasePersonResult,
} from '../../application/dtos/cease-person.dto';
import { PersonRepositoryPort } from '../../domain/ports/person.repository.port';
import { PersonType } from '../../domain/entities/person.entity';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

@Controller('api/v1/people')
export class PersonController {
  constructor(
    private readonly getPeopleUseCase: GetPeopleUseCase,
    private readonly createPersonUseCase: CreatePersonUseCase,
    private readonly updatePersonUseCase: UpdatePersonUseCase,
    private readonly ceasePersonUseCase: CeasePersonUseCase,
    private readonly personRepository: PersonRepositoryPort,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPeople(
    @Query('type') type?: PersonType,
    @Query('search') search?: string,
    @Query('office') office?: string,
  ): Promise<ApiResponseDto<PeopleListResult>> {
    const result = await this.getPeopleUseCase.execute({ type, search, office });
    return ApiResponseDto.ok(result, 'Listado de personas recuperado exitosamente');
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string): Promise<ApiResponseDto<PersonResponseDto>> {
    const person = await this.personRepository.findById(id);
    if (!person) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    return ApiResponseDto.ok(PersonResponseDto.fromDomain(person));
  }

  @Get(':id/cessation-info')
  @HttpCode(HttpStatus.OK)
  async getCessationInfo(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<PersonCessationInfoItem>> {
    const info = await this.ceasePersonUseCase.getCessationInfo(id);
    return ApiResponseDto.ok(info, 'Información de cese y custodia recuperada con éxito');
  }

  @Post(':id/cease')
  @HttpCode(HttpStatus.OK)
  async cease(
    @Param('id') id: string,
    @Body() ceaseDto: CeasePersonDto,
  ): Promise<ApiResponseDto<CeasePersonResult>> {
    const result = await this.ceasePersonUseCase.execute(id, ceaseDto);
    return ApiResponseDto.ok(
      result,
      `Cese laboral y entrega de cargo procesados exitosamente para ${result.fullName}`,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreatePersonDto,
  ): Promise<ApiResponseDto<PersonResponseDto>> {
    const created = await this.createPersonUseCase.execute(createDto);
    return ApiResponseDto.ok(created, 'Persona registrada exitosamente en el SIGM');
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePersonDto,
  ): Promise<ApiResponseDto<PersonResponseDto>> {
    const updated = await this.updatePersonUseCase.execute(id, updateDto);
    return ApiResponseDto.ok(updated, 'Datos de la persona actualizados exitosamente');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<ApiResponseDto<{ deleted: boolean }>> {
    const deleted = await this.personRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    return ApiResponseDto.ok({ deleted: true }, 'Persona eliminada exitosamente');
  }
}
