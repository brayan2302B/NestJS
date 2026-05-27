import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('evidencias')
export class Evidencia {

  @PrimaryGeneratedColumn()
  id_evidencia: number;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 255 })
  carpeta_obligacion: string;

  @Column({ type: 'varchar', length: 215 })
  fotografia: string;

  @Column({ type: 'int', nullable: true })
  fk_actividades: number;

  actividad: any;
}