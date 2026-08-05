import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { Persona } from '../personas/entities/persona.entity';
import { Obligacione } from '../obligaciones/entities/obligacione.entity';
import { InformesService } from '../informes/informes.service';
import { BotHenryWebhookDto } from './dto/bot-henry.dto';
import { AsistenteChatDto } from './dto/asistente-chat.dto';
import { GuardarHistorialDto } from './dto/guardar-historial.dto';
import { ChatUploadDto } from './dto/chat-upload.dto';
import { HistorialConversacion } from './entities/historial-conversacion.entity';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(HistorialConversacion)
    private readonly historialRepository: Repository<HistorialConversacion>,
    @InjectRepository(Obligacione)
    private readonly obligacionesRepository: Repository<Obligacione>,
    private readonly informesService: InformesService,
    private readonly configService: ConfigService,
  ) {}

  // ── 1. Procesamiento de revisión del bot Henry (n8n → NestJS) ───────────────
  async processBotReview(dto: BotHenryWebhookDto) {
    const usuario = await this.personaRepository.findOne({
      where: { numero_documento: dto.cedula.trim() },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con cédula ${dto.cedula} no encontrado en el sistema`,
      );
    }

    const result = await this.informesService.cambiarEstadoReporte(
      dto.periodo,
      dto.tipo_informe.toUpperCase(),
      dto.estado,
      dto.observacion,
      usuario.id_usuario,
    );

    return {
      success: true,
      message: 'Informe actualizado correctamente a través del webhook del bot Henry',
      data: {
        id_informe: result?.id_informe,
        estado: result?.estado,
        instructor: usuario.nombre_completo,
      },
    };
  }

  // ── 2. Chat del Asistente IA (Frontend → NestJS → OpenAI) ───────────────────
  async procesarChatAsistente(
    dto: AsistenteChatDto,
    usuarioPayload: any,
  ): Promise<{ respuesta: string }> {
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!openaiKey) {
      throw new InternalServerErrorException(
        'El servicio de IA no está configurado. Contacta al administrador.',
      );
    }

    const systemPrompt = `Eres el Asistente Virtual STIMI, un asistente especializado en apoyar a instructores del SENA en Colombia.
Tu rol es ayudarles con:
- Redactar y estructurar informes de seguimiento de contrato de aprendizaje (GC - Gestión de Compromiso).
- Redactar informes de seguimiento a la formación (GF - Gestión de Formación).
- Sugerir evidencias pedagógicas según el plan de formación.
- Redactar obligaciones, actividades de aprendizaje y compromisos.
- Dar orientaciones sobre el correcto seguimiento de aprendices.
- Resolver dudas sobre los lineamientos institucionales del SENA.

Instrucciones de comportamiento:
- Responde siempre en español colombiano, de manera profesional pero cercana.
- Cuando te pidan redactar texto para un informe, dale formato claro y listo para copiar.
- Sé conciso en tus respuestas: máximo 3 párrafos, a menos que el usuario pida más detalle.
- No inventes datos de aprendices ni cédulas. Usa placeholders como [NOMBRE DEL APRENDIZ] o [NÚMERO DE FICHA].
- No hagas menciones a tecnologías externas ni recomiendes otras herramientas.`;

    const historialMsgs = (dto.historial ?? []).slice(-10).map((m) => ({
      role: m.rol === 'user' ? 'user' : 'assistant',
      content: m.contenido,
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...historialMsgs,
      { role: 'user', content: dto.mensaje },
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        this.logger.error(`Error de OpenAI: ${response.status} - ${err}`);
        throw new InternalServerErrorException(
          'Error al comunicarse con el servicio de IA. Intenta de nuevo.',
        );
      }

      const data = (await response.json()) as any;
      const respuesta: string =
        data?.choices?.[0]?.message?.content?.trim() ??
        'No pude generar una respuesta. Por favor, intenta de nuevo.';

      return { respuesta };
    } catch (error: any) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(
        'Error interno del asistente. Por favor, intenta más tarde.',
      );
    }
  }

  // ── 2.5. Validación de informe PDF desde el chat web (Frontend → OpenAI + DB) ─
  async procesarSubidaChat(
    file: any,
    dto: ChatUploadDto,
    usuarioPayload: any,
  ): Promise<{
    respuesta: string;
    estado: string;
    id_informe?: number;
  }> {
    if (!file) {
      throw new BadRequestException('Archivo PDF requerido.');
    }

    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new InternalServerErrorException(
        'El servicio de IA no está configurado. Contacta al administrador.',
      );
    }

    // 1. Obtener datos del usuario autenticado
    const usuario = await this.personaRepository.findOne({
      where: { id_usuario: usuarioPayload.sub },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado en el sistema.');
    }

    const cedula = usuario.numero_documento;
    const tipoInforme = dto.tipo_informe.toUpperCase();
    const periodo = dto.periodo;

    // Parsear el periodo: "Julio 2026" → mes="Julio", anio="2026"
    const partesPeriodo = periodo.trim().split(' ');
    const mes = partesPeriodo[0] ?? 'Desconocido';
    const anio = partesPeriodo[1] ?? String(new Date().getFullYear());

    // 2. Leer el archivo PDF como base64
    let base64Pdf: string;
    try {
      const buffer = fs.readFileSync(file.path);
      base64Pdf = buffer.toString('base64');
    } catch {
      throw new InternalServerErrorException(
        'No se pudo leer el archivo subido. Intenta de nuevo.',
      );
    }

    // 3. Construir el prompt según el tipo de informe
    let prompt: string;

    if (tipoInforme === 'GC') {
      // Obtener matriz de obligaciones del instructor
      const obligaciones = await this.obligacionesRepository.find({
        where: { contrato: { usuario: { id_usuario: usuario.id_usuario } } },
        relations: { contrato: true },
        order: { id_obligacion: 'ASC' },
      });

      const matrizObligaciones =
        obligaciones.length > 0
          ? obligaciones
              .map(
                (o, i) =>
                  `• OBL ${i + 1}: ${o.descripcion?.slice(0, 400) ?? 'Sin descripción'}`,
              )
              .join('\n')
          : '• No se encontraron obligaciones contractuales en el sistema para este instructor.';

      prompt = `Eres Sera 🦅, revisora experta de informes GC del SENA.
Contratista: ${cedula} | Período: ${mes} ${anio} | Formato esperado: GTH-F-062 V10

INSTRUCCIONES:
Analiza el PDF del informe GC adjunto y revisa obligación por obligación (1 a 18).
Para cada una indica: ✅ cumple / ⚠️ cumple parcialmente / ❌ no cumple / N/A.

MATRIZ DE OBLIGACIONES (del contrato):
${matrizObligaciones}

FORMATO DEL REPORTE (usa exactamente este formato):
📋 *REPORTE DE REVISIÓN GC*
Contratista: ${cedula} | Período: ${mes} ${anio}

*OBLIGACIONES (1 a N):*
• Obl. X: [✅/⚠️/❌/N/A] breve descripción de lo encontrado

*DATOS BÁSICOS:*
[✅/⚠️/❌] Versión del formato · Fecha coherente · Datos del contratista · Firmas

*CONCLUSIÓN:*
[✅ GC COMPLETO / ⚠️ GC CON OBSERVACIONES / ❌ GC INCOMPLETO]

*OBSERVACIONES:* (solo si hay ⚠️ o ❌)

*ACCIONES REQUERIDAS:* (concretas o "Ninguna")`;
    } else {
      // GF
      prompt = `Eres Sera 🦅, asistente del SENA especializada en revisión de GF (Gestión Financiera).
Contratista: ${cedula} | Período: ${mes} ${anio}

INSTRUCCIONES DE REVISIÓN:
Primero determina si es PRIMER PAGO, PAGO INTERMEDIO o ÚLTIMO PAGO basándote en el contenido del documento.

DOCUMENTOS REQUERIDOS SEGÚN TIPO DE PAGO:
PRIMER PAGO: 1) Documento "Sí Contratista", 2) Afiliación EPS, 3) Pensiones, 4) ARL, 5) RUD, 6) GRF-063-V4, 7) Planilla PILA, 8) Comprobante de pago
PAGO INTERMEDIO: 1) Formato de liquidación GF, 2) Planilla PILA, 3) Comprobante de pago
ÚLTIMO PAGO: igual al primero más documentos de desvinculación.

FORMATO DEL REPORTE:
📋 *REPORTE DE REVISIÓN GF*
Contratista: ${cedula} | Período: ${mes} ${anio}
Tipo de pago detectado: [PRIMER PAGO / PAGO INTERMEDIO / ÚLTIMO PAGO]

*RESULTADO POR DOCUMENTO:*
[Lista numerada con ✅ / ⚠️ / N/A y observación breve]

*COINCIDENCIA DE VALORES:* Planilla vs. Comprobante [✅/❌/⚠️]

*CONCLUSIÓN:*
[✅ GF COMPLETO / ⚠️ GF CON OBSERVACIONES / ❌ GF INCOMPLETO]

*ACCIONES REQUERIDAS:* (concretas o "Ninguna")`;
    }

    // 4. Llamar a OpenAI Responses API (soporta PDFs nativamente)
    let mensajeIA: string;
    try {
      const dataUri = `data:application/pdf;base64,${base64Pdf}`;

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          input: [
            {
              role: 'user',
              content: [
                { type: 'input_text', text: prompt },
                {
                  type: 'input_file',
                  filename: file.originalname,
                  file_data: dataUri,
                },
              ],
            },
          ],
          max_output_tokens: 2000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(
          `[SubidaChat] Error OpenAI Responses API: ${response.status} - ${errText}`,
        );
        throw new InternalServerErrorException(
          'Error al analizar el PDF. Por favor, intenta de nuevo.',
        );
      }

      const data = (await response.json()) as any;
      mensajeIA = '❌ No se pudo analizar el informe.';

      if (data?.output && Array.isArray(data.output)) {
        for (const item of data.output) {
          if (item.content && Array.isArray(item.content)) {
            for (const part of item.content) {
              if (part.type === 'output_text' && part.text) {
                mensajeIA = part.text;
                break;
              }
            }
          }
          if (mensajeIA !== '❌ No se pudo analizar el informe.') break;
        }
      }
    } catch (error: any) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(`[SubidaChat] Error inesperado en OpenAI: ${error.message}`);
      throw new InternalServerErrorException(
        'Error al comunicarse con el servicio de IA. Intenta de nuevo.',
      );
    }

    // 5. Determinar el estado a partir de la respuesta de la IA
    const textoUpper = mensajeIA.toUpperCase();
    let estadoResultante: 'validado' | 'devuelto' | 'pendiente' = 'pendiente';

    if (
      textoUpper.includes('GC COMPLETO') ||
      textoUpper.includes('GF COMPLETO') ||
      textoUpper.includes('✅ GC') ||
      textoUpper.includes('✅ GF')
    ) {
      estadoResultante = 'validado';
    } else if (
      textoUpper.includes('GC INCOMPLETO') ||
      textoUpper.includes('GF INCOMPLETO') ||
      textoUpper.includes('ACCIONES REQUERIDAS') ||
      textoUpper.includes('❌ GC') ||
      textoUpper.includes('❌ GF')
    ) {
      estadoResultante = 'devuelto';
    }

    // 6. Guardar el informe en la base de datos
    let idInforme: number | undefined;
    try {
      const informeGuardado = await this.informesService.uploadReport(
        usuario.id_usuario,
        file,
        periodo,
        tipoInforme,
      );

      if (informeGuardado?.id_informe) {
        idInforme = informeGuardado.id_informe;

        // 7. Actualizar el estado del informe con el resultado de la IA
        await this.informesService.cambiarEstadoReporte(
          periodo,
          tipoInforme,
          estadoResultante,
          mensajeIA.slice(0, 1000), // Truncar observaciones largas
          usuario.id_usuario,
        );
      }
    } catch (dbErr: any) {
      this.logger.warn(
        `[SubidaChat] El informe se analizó pero no se pudo guardar en DB: ${dbErr.message}`,
      );
    }

    this.logger.log(
      `[SubidaChat] Análisis completado: ${tipoInforme} ${periodo} | Estado: ${estadoResultante} | Usuario: ${cedula}`,
    );

    return {
      respuesta: mensajeIA,
      estado: estadoResultante,
      id_informe: idInforme,
    };
  }

  // ── 3. Guardar historial de WhatsApp (n8n → NestJS) ─────────────────────────
  async guardarHistorialWhatsapp(
    dto: GuardarHistorialDto,
  ): Promise<{ success: boolean; id: number }> {
    const registro = this.historialRepository.create({
      remoteJid: dto.remoteJid,
      telefono: dto.telefono,
      rol: dto.rol,
      contenido: dto.contenido,
      tipo_mensaje: dto.tipo_mensaje ?? 'texto',
      cedula: dto.cedula,
      origen: 'whatsapp',
    });

    const saved = await this.historialRepository.save(registro);

    this.logger.log(
      `[HistorialWA] Guardado mensaje de ${dto.telefono} | rol: ${dto.rol} | tipo: ${dto.tipo_mensaje ?? 'texto'}`,
    );

    return { success: true, id: saved.id };
  }

  // ── 4. Obtener historial de WhatsApp para una cédula ─────────────────────────
  async getHistorialPorCedula(cedula: string): Promise<HistorialConversacion[]> {
    return this.historialRepository.find({
      where: { cedula },
      order: { creado_en: 'DESC' },
      take: 50,
    });
  }
}
