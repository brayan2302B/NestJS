import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Contrato } from '../../contratos/entities/contrato.entity';

@Entity('versiones')
export class Version {
  @PrimaryGeneratedColumn()
  id_version!: number;

  @Column({ type: 'int' })
  numero_version!: number;

  @Column({ type: 'date' })
  fecha_version!: Date;

  @Column({ type: 'varchar', length: 255 })
  descripcion!: string;

  @Column({ type: 'varchar', length: 50, default: 'activo' })
  estado!: string;

  @ManyToOne(() => Contrato, (contrato) => contrato.versiones)
  @JoinColumn({ name: 'fk_contrato' })
  contrato!: Contrato;
}
export class Versione {}
