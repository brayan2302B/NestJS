import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Evidencia } from '../../evidencias/entities/evidencia.entity';
import { InformeGc } from '../../informe-gc/entities/informe-gc.entity';

@Entity('actividades')
export class Actividad {

  @PrimaryGeneratedColumn()
  id_actividad: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'varchar', length: 100 })
  competencia: string;

  @Column({ type: 'varchar', length: 3 })
  estado: string;

  @Column({ type: 'date' })
  fecha_fin: Date;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'text' })
  resultado: string;

  @Column({ type: 'int', nullable: true })
  fk_gc: number;

  @ManyToOne(() => InformeGc, (informeGc) => informeGc.actividades, { nullable: true })
  @JoinColumn({ name: 'fk_gc' })
  informeGc: InformeGc;

  @OneToMany(() => Evidencia, (evidencia) => evidencia.actividad)
  evidencias: Evidencia[];
}