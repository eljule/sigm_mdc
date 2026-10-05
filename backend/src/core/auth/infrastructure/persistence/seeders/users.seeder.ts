import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

export interface InitialUserData {
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
  role: string;
  allowedModules: string[];
  isActive: boolean;
}

export const INITIAL_USERS: InitialUserData[] = [
  {
    username: 'root',
    passwordHash: 'admin123',
    fullName: 'Administrador del Sistema SIGM',
    email: 'admin@castilla.gob.pe',
    role: 'Administrador Central',
    allowedModules: [
      'central_dashboard',
      'transport_licenses',
      'it_inventory',
      'helpdesk_support',
    ],
    isActive: true,
  },
];

@Injectable()
export class UsersSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersSeederService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    try {
      const rootUser = await this.userRepo.findOne({
        where: [{ username: 'root' }, { username: 'ROOT' }],
      });
      if (!rootUser) {
        const rootData = INITIAL_USERS[0];
        await this.userRepo.save(this.userRepo.create(rootData));
        this.logger.log('Usuario ROOT asegurado en core_users.');
      } else {
        this.logger.log('Usuario ROOT verificado y activo.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error al asegurar usuario ROOT: ${message}`);
    }
  }
}
