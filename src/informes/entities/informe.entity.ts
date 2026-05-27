import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Version } from '../../versiones/entities/version.entity';

@Entity('informes')
export class Informe {
  @PrimaryGeneratedColumn()
  id_informe!: number;

  @Column({ type: 'varchar', length: 150 })
  titulo!: string;

  @Column({ type: 'date' })
  fecha_informe!: Date;

  @Column({ type: 'varchar', length: 50, default: 'pendiente' })
  estado!: string;

  @ManyToOne(() => Version)
  @JoinColumn({ name: 'fk_version' })
  version!: Version;
}

export class Informe {}
