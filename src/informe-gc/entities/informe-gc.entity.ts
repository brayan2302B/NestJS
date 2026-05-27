import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Actividad } from '../../actividades/entities/actividade.entity';
import { Informe } from '../../informes/entities/informe.entity';

@Entity('informe_gc')
export class InformeGc {

  @PrimaryGeneratedColumn()
  id_gc: number;

  @Column({ type: 'varchar', length: 50 })
  version_gc: string;

  @ManyToOne(() => Informe, { nullable: true })
  @JoinColumn({ name: 'fk_informe' })
  informe: Informe;

  @OneToMany(() => Actividad, (actividad) => actividad.informeGc)
  actividades: Actividad[];
}