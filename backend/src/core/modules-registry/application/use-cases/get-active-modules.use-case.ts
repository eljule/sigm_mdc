import { Injectable } from '@nestjs/common';
import { ModuleRepositoryPort } from '../../domain/ports/module.repository.port';
import { ModuleResponseDto } from '../dtos/module-response.dto';

/**
 * Caso de uso: Recuperar todos los subsistemas/módulos activos del SIGM.
 * Orquesta la llamada al puerto del repositorio y mapea hacia DTOs para la salida.
 */
@Injectable()
export class GetActiveModulesUseCase {
  constructor(private readonly moduleRepository: ModuleRepositoryPort) {}

  async execute(): Promise<ModuleResponseDto[]> {
    const activeModules = await this.moduleRepository.findAllActive();
    return activeModules.map((m) => ModuleResponseDto.fromDomain(m));
  }
}
