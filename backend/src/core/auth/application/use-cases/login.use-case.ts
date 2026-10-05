import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class LoginUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const usernameClean = dto.username.trim();
    const user = await this.userRepository.findByUsername(usernameClean);

    if (!user) {
      throw new UnauthorizedException('Credenciales de acceso inválidas o usuario no registrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva. Contacte a ODT');
    }

    const isValid = user.validatePassword(dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales de acceso inválidas');
    }

    // Token simulado para la Fase 1/2
    const token = `sigm_token_${user.id}_${Date.now()}`;

    return AuthResponseDto.fromDomain(user, token);
  }
}
