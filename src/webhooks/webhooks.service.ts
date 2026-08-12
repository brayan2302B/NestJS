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
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require('pdf-parse');

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

    // 2. Extraer texto del PDF con pdf-parse
    let textoPdf: string;
    try {
      const buffer = fs.readFileSync(file.path);
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      textoPdf = pdfData.text ?? '';
      await parser.destroy();
      this.logger.log(
        `[SubidaChat] PDF extraído: ${textoPdf.length} caracteres de '${file.originalname}'`,
      );
    } catch (parseErr: any) {
      this.logger.error(`[SubidaChat] Error extrayendo texto del PDF: ${parseErr.message}`);
      throw new InternalServerErrorException(
        'No se pudo leer el contenido del PDF. Verifica que el archivo no esté protegido con contraseña.',
      );
    }

    if (!textoPdf || textoPdf.trim().length < 50) {
      throw new BadRequestException(
        'El PDF no contiene texto legible. Asegúrate de que no sea una imagen escaneada sin OCR.',
      );
    }

    // Limitar a 12.000 caracteres para no exceder tokens
    const textoRecortado = textoPdf.slice(0, 12000);

    // 3. Construir el prompt según el tipo de informe
    let systemPrompt: string;
    let userPrompt: string;

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
                  `• OBL ${i + 1}: ${o.descripcion?.slice(0, 300) ?? 'Sin descripción'}`,
              )
              .join('\n')
          : '• Sin obligaciones contractuales registradas (se evaluará con criterio general GTH-F-062).';

      systemPrompt = `Eres Sera, revisora experta de informes GC del SENA (GTH-F-062 V10).
Analiza el texto extraído del informe y responde con el reporte estructurado.
Sé precisa y objetiva. Usa exactamente el formato solicitado.`;

      userPrompt = `Revisa el siguiente informe GC.
Contratista: ${cedula} | Período declarado: ${mes} ${anio}

MATRIZ DE OBLIGACIONES (del sistema):
${matrizObligaciones}

TEXTO EXTRAÍDO DEL PDF:
${textoRecortado}

FORMATO DEL REPORTE (responde exactamente así):
📋 *REPORTE DE REVISIÓN GC*
Contratista: ${cedula} | Período: ${mes} ${anio} | Archivo: ${file.originalname}

*0. VERIFICACIÓN DE PERÍODO:*
El documento debe corresponder al período declarado: ${mes} ${anio}.
Busca fechas, encabezados o menciones de mes/año en el documento y confirma si coinciden.
[✅ Período correcto: ${mes} ${anio} / ❌ Período incorrecto o no identificado → INCOMPLETO]

*1. DATOS BÁSICOS:*
[✅/⚠️/❌] Versión formato · [✅/❌] Fecha coherente · [✅/❌] Datos contratista · [✅/❌] Firmas

*2. OBLIGACIONES (1 a 18):*
• Obl. 1: [✅/⚠️/❌/N/A] descripción breve
• (una línea por cada obligación)

*CONCLUSIÓN:*
[✅ GC COMPLETO / ⚠️ GC CON OBSERVACIONES / ❌ GC INCOMPLETO]

*OBSERVACIONES:* (solo si hay ⚠️ o ❌, de lo contrario: "Ninguna")

*ACCIONES REQUERIDAS:* (concretas o "Ninguna")`;
    } else {
      // GF
      systemPrompt = `Eres Sera, experta en revisión de informes GF (Gestión Financiera) del SENA.
Analiza el texto extraído del informe y responde con el reporte estructurado.
Sé precisa y objetiva. Usa exactamente el formato solicitado.`;

      userPrompt = `Revisa el siguiente informe GF.
Contratista: ${cedula} | Período declarado: ${mes} ${anio}

TEXTO EXTRAÍDO DEL PDF:
${textoRecortado}

INSTRUCCIONES:
Primero verifica que el período declarado (${mes} ${anio}) coincida con las fechas mencionadas en el documento.
Si el período no coincide o no se identifica, marca como ❌ y considera INCOMPLETO.
Luego determina si es PRIMER PAGO, PAGO INTERMEDIO o ÚNTIMO PAGO.

DOCUMENTOS REQUERIDOS:
• PRIMER PAGO: 1) Doc "Sí Contratista", 2) Afiliación EPS, 3) Pensiones, 4) ARL, 5) RUD, 6) GRF-063-V4, 7) Planilla PILA, 8) Comprobante pago
• PAGO INTERMEDIO: 1) Formato liquidación GF firmado, 2) Planilla PILA, 3) Comprobante pago
• ÚNTIMO PAGO: igual al primero + documentos de desvinculación

FORMATO DEL REPORTE:
📋 *REPORTE DE REVISIÓN GF*
Contratista: ${cedula} | Período: ${mes} ${anio} | Archivo: ${file.originalname}

*0. VERIFICACIÓN DE PERÍODO:*
[✅ Período correcto: ${mes} ${anio} / ❌ Período incorrecto o no identificado → INCOMPLETO]
Tipo de pago detectado: [PRIMER PAGO / PAGO INTERMEDIO / ÚNTIMO PAGO]

*RESULTADO POR DOCUMENTO:*
[Lista numerada con ✅ / ⚠️ / N/A y observación breve]

*COINCIDENCIA DE VALORES:*
Planilla vs. Comprobante: [✅ Coinciden / ❌ No coinciden / ⚠️ No verificable]

*CONCLUSIÓN:*
[✅ GF COMPLETO / ⚠️ GF CON OBSERVACIONES / ❌ GF INCOMPLETO]

*ACCIONES REQUERIDAS:* (concretas o "Ninguna")`;
    }

    // 4. Llamar a OpenAI Chat Completions con el texto extraído del PDF
    let mensajeIA: string;
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 2000,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(
          `[SubidaChat] Error OpenAI Chat API: ${response.status} - ${errText}`,
        );
        throw new InternalServerErrorException(
          'Error al analizar el PDF con IA. Por favor, intenta de nuevo.',
        );
      }

      const data = (await response.json()) as any;
      mensajeIA =
        data?.choices?.[0]?.message?.content?.trim() ??
        '❌ No se pudo generar el análisis del informe.';
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

    // 6. Guardar el informe en la base de datos solo si el resultado NO es 'devuelto'
    // (P1: un informe analizado como devuelto no debe registrarse en el sistema)
    let idInforme: number | undefined;
    if (estadoResultante !== 'devuelto') {
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
            mensajeIA.slice(0, 1000),
            usuario.id_usuario,
          );
        }
      } catch (dbErr: any) {
        this.logger.warn(
          `[SubidaChat] El informe se analizó pero no se pudo guardar en DB: ${dbErr.message}`,
        );
      }
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
