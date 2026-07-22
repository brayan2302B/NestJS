import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Informe } from './entities/informe.entity';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { InformeGc } from '../informe-gc/entities/informe-gc.entity';
import { InformeGf } from '../informe-gf/entities/informe-gf.entity';
import { Actividad } from '../actividades/entities/actividade.entity';
import { Evidencia } from '../evidencias/entities/evidencia.entity';
import { InformeGcPdfResponseDto } from './dto/informe-gc-pdf-response.dto';
import { Persona } from '../personas/entities/persona.entity';
import { Version } from '../versiones/entities/version.entity';
import { PeriodoCarga } from '../periodos-carga/entities/periodo-carga.entity';
import { Contrato } from '../contratos/entities/contrato.entity';

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informeRepository: Repository<Informe>,
    @InjectRepository(InformeGc)
    private readonly informeGcRepository: Repository<InformeGc>,
    @InjectRepository(InformeGf)
    private readonly informeGfRepository: Repository<InformeGf>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
    @InjectRepository(Evidencia)
    private readonly evidenciaRepository: Repository<Evidencia>,
    @InjectRepository(Version)
    private readonly versionRepository: Repository<Version>,
    @InjectRepository(PeriodoCarga)
    private readonly periodoCargaRepository: Repository<PeriodoCarga>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
  ) {}

  // ── MÉTODOS DE INTEGRACIÓN CON EL FRONTEND ──

  async getUserWithArea(userId: number): Promise<Persona> {
    const user = await this.personaRepository.findOne({
      where: { id_usuario: userId },
      relations: { area: true, rol: true },
    });
    if (!user) {
      throw new NotFoundException(`Usuario #${userId} no encontrado`);
    }
    return user;
  }

  async findInstructorReports(idUsuario: number) {
    return this.informeRepository.find({
      where: { usuario: { id_usuario: idUsuario } },
      relations: { periodo: true, usuario: true, versiones: true },
      order: {
        periodo: { anio: 'DESC', mes: 'DESC' },
        created_at: 'DESC',
      },
    });
  }

  async findCoordinatorReports(areaId?: number) {
    const whereClause = areaId ? { usuario: { area: { id_area: areaId } } } : {};
    return this.informeRepository.find({
      where: whereClause,
      relations: { periodo: true, usuario: { area: true }, versiones: true },
      order: {
        periodo: { anio: 'DESC', mes: 'DESC' },
        created_at: 'DESC',
      },
    });
  }

  async findHistorial(idUsuario: number, isCoordinator: boolean, areaId?: number) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const query = this.informeRepository.createQueryBuilder('informe')
      .leftJoinAndSelect('informe.periodo', 'periodo')
      .leftJoinAndSelect('informe.usuario', 'usuario')
      .leftJoinAndSelect('usuario.area', 'area')
      .leftJoinAndSelect('informe.versiones', 'versiones')
      .where('(periodo.anio < :currentYear OR (periodo.anio = :currentYear AND periodo.mes < :currentMonth))', {
        currentYear,
        currentMonth,
      });

    if (!isCoordinator) {
      query.andWhere('usuario.id_usuario = :idUsuario', { idUsuario });
    } else if (areaId) {
      query.andWhere('area.id_area = :areaId', { areaId });
    }

    query.orderBy('periodo.anio', 'DESC')
         .addOrderBy('periodo.mes', 'DESC')
         .addOrderBy('versiones.numero_version', 'DESC');

    return query.getMany();
  }

  async uploadReport(idUsuario: number, file: any, periodoStr: string, tipo: string) {
    const user = await this.getUserWithArea(idUsuario);
    const periodo = await this.findOrCreatePeriodo(periodoStr);
    const tipoInforme = tipo.toUpperCase();

    // Check if report already exists
    let informe = await this.informeRepository.findOne({
      where: {
        usuario: { id_usuario: idUsuario },
        periodo: { id_periodo: periodo.id_periodo },
        tipo_informe: tipoInforme,
      },
      relations: { versiones: true },
    });

    if (informe) {
      // If it exists, we treat it as uploading a new version
      return this.uploadNuevaVersion(idUsuario, file, periodoStr, tipo);
    }

    // Create new Informe
    informe = this.informeRepository.create({
      usuario: user,
      periodo: periodo,
      tipo_informe: tipoInforme,
      estado: 'pendiente',
      firmado: false,
    });
    await this.informeRepository.save(informe);

    // Create sub-table record based on type
    if (tipoInforme === 'GC') {
      let contrato = await this.contratoRepository.findOne({
        where: { usuario: { id_usuario: idUsuario }, estado: 'activo' },
      });
      if (!contrato) {
        contrato = this.contratoRepository.create({
          usuario: user,
          fecha_inicio: new Date(new Date().getFullYear(), 0, 1),
          fecha_fin: new Date(new Date().getFullYear(), 11, 31),
          estado: 'activo',
        });
        await this.contratoRepository.save(contrato);
      }

      const informeGc = this.informeGcRepository.create({
        informe,
        contrato,
        version_formato: 'GTH-F-062 V10',
      });
      await this.informeGcRepository.save(informeGc);
    } else {
      const informeGf = this.informeGfRepository.create({
        informe,
        version_formato: 'GF-F-001 V2',
        valor_total: 0,
      });
      await this.informeGfRepository.save(informeGf);
    }

    // Create version 1
    const version = this.versionRepository.create({
      informe,
      numero_version: 1,
      archivo_ruta: file.path.replace(/\\/g, '/'),
      archivo_nombre_original: file.originalname,
      archivo_tamano_bytes: file.size,
      estado: 'pendiente',
    });
    await this.versionRepository.save(version);

    // Reload and return
    return this.informeRepository.findOne({
      where: { id_informe: informe.id_informe },
      relations: { periodo: true, usuario: true, versiones: true },
    });
  }

  async uploadNuevaVersion(idUsuario: number, file: any, periodoStr: string, tipo: string) {
    const periodo = await this.findOrCreatePeriodo(periodoStr);
    const tipoInforme = tipo.toUpperCase();

    const informe = await this.informeRepository.findOne({
      where: {
        usuario: { id_usuario: idUsuario },
        periodo: { id_periodo: periodo.id_periodo },
        tipo_informe: tipoInforme,
      },
      relations: { versiones: true },
    });

    if (!informe) {
      // If it doesn't exist, create it from scratch
      return this.uploadReport(idUsuario, file, periodoStr, tipo);
    }

    // Determine new version number
    let nextVersionNumber = 1;
    if (informe.versiones && informe.versiones.length > 0) {
      const highestVersion = Math.max(...informe.versiones.map(v => v.numero_version));
      nextVersionNumber = highestVersion + 1;
    }

    // Create the new version record
    const version = this.versionRepository.create({
      informe,
      numero_version: nextVersionNumber,
      archivo_ruta: file.path.replace(/\\/g, '/'),
      archivo_nombre_original: file.originalname,
      archivo_tamano_bytes: file.size,
      estado: 'pendiente',
    });
    await this.versionRepository.save(version);

    // Reset report state to pending and clear old observations
    informe.estado = 'pendiente';
    informe.observacion = undefined;
    await this.informeRepository.save(informe);

    return this.informeRepository.findOne({
      where: { id_informe: informe.id_informe },
      relations: { periodo: true, usuario: true, versiones: true },
    });
  }

  async getDetalleReporte(idUsuario: number, periodoStr: string, tipo: string, isCoordinator: boolean) {
    const periodo = await this.findOrCreatePeriodo(periodoStr);
    const tipoInforme = tipo.toUpperCase();

    const whereClause: any = {
      periodo: { id_periodo: periodo.id_periodo },
      tipo_informe: tipoInforme,
    };

    if (!isCoordinator) {
      whereClause.usuario = { id_usuario: idUsuario };
    }

    const report = await this.informeRepository.findOne({
      where: whereClause,
      relations: {
        usuario: { area: true, rol: true },
        periodo: true,
        versiones: true,
      },
    });

    if (!report) {
      return {
        id_informe: null,
        estado: 'No cargado',
        periodo: {
          id_periodo: periodo.id_periodo,
          mes: periodo.mes,
          anio: periodo.anio,
          nombre: periodoStr,
        },
        tipo_informe: tipoInforme,
        versiones: [],
      };
    }

    // Sort versions by version number desc
    if (report.versiones) {
      report.versiones.sort((a, b) => b.numero_version - a.numero_version);
    }

    return report;
  }

  async cambiarEstadoReporte(
    periodoStr: string,
    tipo: string,
    estado: string,
    observacion?: string,
    idUsuario?: number,
  ) {
    const periodo = await this.findOrCreatePeriodo(periodoStr);
    const tipoInforme = tipo.toUpperCase();

    const whereClause: any = {
      periodo: { id_periodo: periodo.id_periodo },
      tipo_informe: tipoInforme,
    };

    if (idUsuario) {
      whereClause.usuario = { id_usuario: idUsuario };
    }

    const report = await this.informeRepository.findOne({
      where: whereClause,
      relations: { versiones: true, usuario: true, periodo: true },
    });

    if (!report) {
      throw new NotFoundException(`Informe de tipo ${tipoInforme} para el periodo ${periodoStr} no encontrado`);
    }

    // Map state strings to match database standard
    let mappedEstado = estado.toLowerCase();
    if (mappedEstado === 'aprobado' || mappedEstado === 'validado') {
      mappedEstado = 'validado';
    } else if (mappedEstado === 'rechazado' || mappedEstado === 'devuelto') {
      mappedEstado = 'devuelto';
    } else {
      mappedEstado = 'pendiente';
    }

    report.estado = mappedEstado;
    report.observacion = observacion || undefined;
    await this.informeRepository.save(report);

    // Sync latest version
    if (report.versiones && report.versiones.length > 0) {
      report.versiones.sort((a, b) => b.numero_version - a.numero_version);
      const latestVersion = report.versiones[0];
      latestVersion.estado = mappedEstado;
      latestVersion.observacion = observacion || undefined;
      await this.versionRepository.save(latestVersion);
    }

    return this.informeRepository.findOne({
      where: { id_informe: report.id_informe },
      relations: { periodo: true, usuario: true, versiones: true },
    });
  }

  // ── MÉTODOS AUXILIARES ──

  private parsePeriod(periodoStr: string): { mes: number; anio: number } {
    const trimmed = decodeURIComponent(periodoStr).trim();
    const regex = /([a-zA-ZáéíóúÁÉÍÓÚ]+)[-\s]+(\d{4})/;
    const match = trimmed.match(regex);
    if (!match) {
      throw new BadRequestException('Formato de periodo inválido. Use "Mes Año" (ej: "Julio 2026")');
    }
    const mesStr = match[1].toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
    const anio = parseInt(match[2]);

    const mesesMap: Record<string, number> = {
      enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
      julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
    };

    const mes = mesesMap[mesStr];
    if (!mes) {
      throw new BadRequestException(`Mes inválido: ${match[1]}`);
    }

    return { mes, anio };
  }

  private async findOrCreatePeriodo(periodoStr: string): Promise<PeriodoCarga> {
    const { mes, anio } = this.parsePeriod(periodoStr);
    let periodo = await this.periodoCargaRepository.findOne({
      where: { mes, anio },
    });

    if (!periodo) {
      const limitDate = new Date(anio, mes, 0); // last day of month
      periodo = this.periodoCargaRepository.create({
        mes,
        anio,
        fecha_limite: limitDate,
        habilitado: true,
      });
      await this.periodoCargaRepository.save(periodo);
    }

    return periodo;
  }

  // ── MÉTODOS ORIGINALES (MANTENIDOS PARA COMPATIBILIDAD) ──

  async create(createInformeDto: CreateInformeDto) {
    const informe = this.informeRepository.create(createInformeDto);
    return this.informeRepository.save(informe);
  }

  findAll() {
    return this.informeRepository.find({ relations: { usuario: true, periodo: true } });
  }

  findOne(id: number) {
    return this.informeRepository.findOne({
      where: { id_informe: id },
      relations: { usuario: true, periodo: true },
    });
  }

  update(id: number, updateInformeDto: UpdateInformeDto) {
    return this.informeRepository.update(id, updateInformeDto);
  }

  remove(id: number) {
    return this.informeRepository.softDelete(id);
  }

  async getDatosPdfGc(id: number): Promise<InformeGcPdfResponseDto> {
    const informe = await this.informeRepository.findOne({
      where: { id_informe: id },
      relations: {
        usuario: { area: true, rol: true },
        periodo: true,
        informeGc: { contrato: { obligaciones: true, usuario: true }, actividades: { evidencias: true } },
      },
    });

    if (!informe) {
      throw new NotFoundException(`Informe #${id} no encontrado`);
    }

    if (informe.tipo_informe !== 'GC' || !informe.informeGc) {
      throw new BadRequestException('El informe no está asociado a un formato GC válido');
    }

    const actividades = informe.informeGc.actividades ?? [];
    const totalEvidencias = actividades.reduce((sum, actividad) => sum + (actividad.evidencias?.length ?? 0), 0);
    const actividadesPorCompetencia = actividades.reduce<Record<string, number>>((acc, actividad) => {
      acc[actividad.competencia] = (acc[actividad.competencia] ?? 0) + 1;
      return acc;
    }, {});

    const coordinador = informe.usuario.aprobado_por_id
      ? await this.informeRepository.manager.getRepository(Persona).findOne({
          where: { id_usuario: informe.usuario.aprobado_por_id },
          relations: { area: true, rol: true },
        })
      : null;

    const response: InformeGcPdfResponseDto = {
      informe: {
        id_informe: informe.id_informe,
        tipo_informe: informe.tipo_informe,
        estado: informe.estado,
        firmado: informe.firmado,
        pendiente_sincronizacion: informe.pendiente_sincronizacion,
        fecha_envio: informe.fecha_envio ? informe.fecha_envio.toISOString() : null,
        version_formato: informe.informeGc.version_formato,
      },
      instructor: {
        id_usuario: informe.usuario.id_usuario,
        nombre_completo: informe.usuario.nombre_completo,
        tipo_documento: informe.usuario.tipo_documento,
        numero_documento: informe.usuario.numero_documento,
        correo: informe.usuario.correo,
        area: {
          id_area: informe.usuario.area?.id_area ?? 0,
          nombre_area: informe.usuario.area?.nombre_area ?? '',
        },
        rol: {
          id_rol: informe.usuario.rol?.id_rol ?? 0,
          nombre_rol: informe.usuario.rol?.nombre_rol ?? '',
        },
        firma_digital_ruta: informe.usuario.firma_digital_ruta ?? null,
      },
      periodo: {
        id_periodo: informe.periodo.id_periodo,
        anio: informe.periodo.anio,
        mes: informe.periodo.mes,
      },
      contrato: {
        id_contrato: informe.informeGc.contrato.id_contrato,
        fecha_inicio: informe.informeGc.contrato.fecha_inicio.toISOString().slice(0, 10),
        fecha_fin: informe.informeGc.contrato.fecha_fin.toISOString().slice(0, 10),
        estado: informe.informeGc.contrato.estado,
        obligaciones: (informe.informeGc.contrato.obligaciones ?? []).map((obligacion) => ({
          id_obligacion: obligacion.id_obligacion,
          descripcion: obligacion.descripcion,
        })),
      },
      coordinador: coordinador
        ? {
            id_usuario: coordinador.id_usuario,
            nombre_completo: coordinador.nombre_completo,
            correo: coordinador.correo,
            area: coordinador.area ? { id_area: coordinador.area.id_area, nombre_area: coordinador.area.nombre_area } : null,
            rol: coordinador.rol ? { id_rol: coordinador.rol.id_rol, nombre_rol: coordinador.rol.nombre_rol } : null,
          }
        : null,
      actividades: actividades.map((actividad) => ({
        id_actividad: actividad.id_actividad,
        fecha_inicio: actividad.fecha_inicio.toISOString().slice(0, 10),
        fecha_fin: actividad.fecha_fin.toISOString().slice(0, 10),
        competencia: actividad.competencia,
        resultado: actividad.resultado,
        estado: actividad.estado,
        evidencias: (actividad.evidencias ?? []).map((evidencia) => ({
          id_evidencia: evidencia.id_evidencia,
          descripcion: evidencia.descripcion,
          carpeta_obligacion: evidencia.carpeta_obligacion,
          ruta_archivo: evidencia.ruta_archivo,
          tipo_archivo: evidencia.tipo_archivo,
          tamano_bytes: evidencia.tamano_bytes,
        })),
      })),
      observaciones: [],
      totales: {
        total_actividades: actividades.length,
        total_evidencias: totalEvidencias,
      },
      estadisticas: {
        actividades_por_competencia: actividadesPorCompetencia,
      },
    };

    return response;
  }
}