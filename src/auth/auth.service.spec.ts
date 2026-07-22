import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Persona } from '../personas/entities/persona.entity';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let repo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Persona),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should login with valid credentials', async () => {
    const passwordHash = bcrypt.hashSync('Sena1234', 10);
    repo.findOne.mockResolvedValue({
      id_persona: 1,
      correo: 'instructor@sena.edu.co',
      passwordHash,
      nombre: 'Instructor',
      role: 'instructor',
    });

    const result = await service.login({ email: 'instructor@sena.edu.co', password: 'Sena1234' });

    expect(result.accessToken).toBeDefined();
    expect(result.user.correo).toBe('instructor@sena.edu.co');
    expect(result.user.role).toBe('instructor');
  });
});
