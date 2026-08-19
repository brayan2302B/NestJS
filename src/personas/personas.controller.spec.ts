import { Test, TestingModule } from '@nestjs/testing';
import { PersonasController } from './personas.controller';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { BadRequestException } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';

describe('PersonasController - Registro y Aceptación de Términos', () => {
  let controller: PersonasController;
  let service: PersonasService;

  const mockPersonasService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonasController],
      providers: [
        {
          provide: PersonasService,
          useValue: mockPersonasService,
        },
        Reflector,
      ],
    })
      .overrideGuard(JwtGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PersonasController>(PersonasController);
    service = module.get<PersonasService>(PersonasService);
  });

  it('debe registrar exitosamente si aceptaTerminos es true', async () => {
    const dto: CreatePersonaDto = {
      nombreCompleto: 'Test User',
      email: 'test@sena.edu.co',
      tipoDocumento: 'CC',
      numeroDocumento: '11223344',
      contrasena: 'Test1234*',
      confirmarContrasena: 'Test1234*',
      aceptaTerminos: true,
    };

    mockPersonasService.create.mockResolvedValue({ id_usuario: 99 });

    const result = await controller.create(dto);
    expect(result.success).toBe(true);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('debe fallar si aceptaTerminos es false en el servicio', async () => {
    const realService = new PersonasService({
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({}),
    } as any);

    const dto: CreatePersonaDto = {
      nombreCompleto: 'Test User',
      email: 'test@sena.edu.co',
      tipoDocumento: 'CC',
      numeroDocumento: '11223344',
      contrasena: 'Test1234*',
      confirmarContrasena: 'Test1234*',
      aceptaTerminos: false,
    };

    await expect(realService.create(dto)).rejects.toThrow(BadRequestException);
    await expect(realService.create(dto)).rejects.toThrow(
      'Es obligatorio aceptar el tratamiento de datos personales para registrarse.',
    );
  });
});
