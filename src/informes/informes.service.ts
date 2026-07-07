import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Informe } from './entities/informe.entity';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { InformeGc } from '../informe-gc/entities/informe-gc.entity';
import { Actividad } from '../actividades/entities/actividade.entity';
import { Evidencia } from '../evidencias/entities/evidencia.entity';
import { InformeGcPdfResponseDto } from './dto/informe-gc-pdf-response.dto';
import { Persona } from '../personas/entities/persona.entity';

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informeRepository: Repository<Informe>,
    @InjectRepository(InformeGc)
    private readonly informeGcRepository: Repository<InformeGc>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
    @InjectRepository(Evidencia)
    private readonly evidenciaRepository: Repository<Evidencia>,
  ) {}

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

    // TODO: pendiente entidad Observacion
    return response;
  }
}