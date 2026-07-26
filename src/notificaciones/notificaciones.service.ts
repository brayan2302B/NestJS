import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion, NotificacionTipo } from './entities/notificacion.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notifRepository: Repository<Notificacion>,
  ) {}

  /** Devuelve todas las notificaciones de un usuario, las más recientes primero */
  async findByUsuario(userId: number): Promise<Notificacion[]> {
    return this.notifRepository.find({
      where: { usuario: { id_usuario: userId } },
      order: { created_at: 'DESC' },
    });
  }

  /** Cuenta cuántas notificaciones no leídas tiene un usuario */
  async countUnread(userId: number): Promise<number> {
    return this.notifRepository.count({
      where: { usuario: { id_usuario: userId }, leida: false },
    });
  }

  /** Marca una notificación específica como leída */
  async marcarLeida(id: number, userId: number): Promise<Notificacion> {
    const notif = await this.notifRepository.findOne({
      where: { id_notificacion: id, usuario: { id_usuario: userId } },
    });
    if (!notif) {
      throw new NotFoundException(`Notificación #${id} no encontrada`);
    }
    notif.leida = true;
    return this.notifRepository.save(notif);
  }

  /** Marca todas las notificaciones del usuario como leídas */
  async marcarTodasLeidas(userId: number): Promise<{ updated: number }> {
    const result = await this.notifRepository.update(
      { usuario: { id_usuario: userId }, leida: false },
      { leida: true },
    );
    return { updated: result.affected ?? 0 };
  }

  /** Crea una notificación para un usuario (usado internamente por otros servicios) */
  async crear(
    userId: number,
    mensaje: string,
    tipo: NotificacionTipo = 'info',
  ): Promise<Notificacion> {
    const notif = this.notifRepository.create({
      usuario: { id_usuario: userId } as any,
      mensaje,
      tipo,
    });
    return this.notifRepository.save(notif);
  }
}
