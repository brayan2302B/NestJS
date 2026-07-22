import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Persona } from '../../personas/entities/persona.entity';
import { Version } from '../../versiones/entities/version.entity';

@Entity('informes')
export class Informe {
  @PrimaryGeneratedColumn()
  id_informe!: number;

  @Column({ type: 'varchar', length: 120 })
  periodo!: string;

  @Column({ type: 'varchar', length: 20 })
  tipo!: 'GC' | 'GF';

  @Column({ type: 'varchar', length: 120, nullable: true })
  titulo?: string;

  @Column({ type: 'varchar', length: 50, default: 'No cargado' })
  estado!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  archivoUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  archivoNombre?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observacion?: string;

  @Column({ type: 'datetime', nullable: true })
  fechaUltimaActualizacion?: Date;

  @ManyToOne(() => Persona, { eager: true, nullable: true })
  @JoinColumn({ name: 'fk_persona' })
  instructor?: Persona;

  @ManyToOne(() => Version, { eager: true, nullable: true })
  @JoinColumn({ name: 'fk_version' })
  version?: Version;

  @OneToMany(() => Informe, (informe) => informe.padre, { cascade: true })
  versiones?: Informe[];

  @ManyToOne(() => Informe, (informe) => informe.versiones, { nullable: true })
  @JoinColumn({ name: 'fk_informe_padre' })
  padre?: Informe;
}


