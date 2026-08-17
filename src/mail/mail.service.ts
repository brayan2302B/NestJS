import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: false, // TLS — port 587
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'Stimi');
    const fromUser = this.configService.get<string>('MAIL_USER');

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f7; margin: 0; padding: 0; }
          .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
          .header { background: #39A900; padding: 32px 24px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px; }
          .body { padding: 32px 28px; color: #333; }
          .body p { font-size: 15px; line-height: 1.6; }
          .token-box { background: #f0f7ee; border: 1.5px dashed #39A900; border-radius: 8px; padding: 16px 20px; margin: 24px 0; text-align: center; }
          .token-box code { font-size: 13px; font-family: monospace; word-break: break-all; color: #1a5c00; }
          .footer { background: #f4f4f7; padding: 16px 24px; text-align: center; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>🔐 Recuperación de Contraseña — Stimi</h1>
          </div>
          <div class="body">
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Stimi (SENA)</strong>.</p>
            <p>Copia y pega el siguiente token de recuperación en la aplicación:</p>
            <div class="token-box">
              <code>${token}</code>
            </div>
            <p><strong>⚠️ Este token expira en 1 hora.</strong> Si no solicitaste este cambio, ignora este correo — tu contraseña no será modificada.</p>
            <p>Saludos,<br/>El equipo de Stimi SENA</p>
          </div>
          <div class="footer">
            Este es un correo automático, por favor no respondas a este mensaje.
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromUser}>`,
      to,
      subject: '🔐 Recuperación de contraseña — Stimi',
      html,
    });

    this.logger.log(`Password reset email sent to ${to}`);
  }

  async sendNotificationEmail(to: string, subject: string, message: string, type: string = 'info'): Promise<void> {
    const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'Stimi');
    const fromUser = this.configService.get<string>('MAIL_USER');

    const typeIcons: Record<string, string> = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
    };
    const icon = typeIcons[type] || '🔔';

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f7; margin: 0; padding: 0; }
          .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
          .header { background: #39A900; padding: 32px 24px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px; }
          .body { padding: 32px 28px; color: #333; }
          .body p { font-size: 15px; line-height: 1.6; }
          .msg-box { background: #f9f9fb; border-left: 4px solid #39A900; padding: 16px; margin: 24px 0; border-radius: 4px; }
          .msg-box p { margin: 0; font-size: 14px; color: #444; }
          .footer { background: #f4f4f7; padding: 16px 24px; text-align: center; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>${icon} Nueva Notificación — Stimi</h1>
          </div>
          <div class="body">
            <p>Hola,</p>
            <p>Tienes una nueva notificación en la plataforma <strong>Stimi (SENA)</strong>:</p>
            <div class="msg-box">
              <p>${message}</p>
            </div>
            <p>Puedes acceder a la plataforma para ver más detalles.</p>
            <p>Saludos,<br/>El equipo de Stimi SENA</p>
          </div>
          <div class="footer">
            Este es un correo automático, por favor no respondas a este mensaje. Si no deseas recibir estos correos, puedes desactivar la opción en la configuración de tu perfil.
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromUser}>`,
      to,
      subject: subject || `${icon} Notificación de Stimi`,
      html,
    });

    this.logger.log(`Notification email sent to ${to}`);
  }
}
