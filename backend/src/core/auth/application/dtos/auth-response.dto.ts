import { User } from '../../domain/entities/user.entity';

export interface UserSummaryDto {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  allowedModules: string[];
}

export class AuthResponseDto {
  token!: string;
  user!: UserSummaryDto;

  static fromDomain(user: User, token = 'jwt_sigm_mock_token'): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.token = token;
    dto.user = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      allowedModules: user.allowedModules,
    };
    return dto;
  }
}
