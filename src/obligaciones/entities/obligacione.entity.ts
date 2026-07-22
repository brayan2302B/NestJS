import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Contrato } from '../../contratos/entities/contrato.entity';

@Entity('obligaciones')
export class Obligacione {
  @PrimaryGeneratedColumn()
  id_obligaciones!: number;

  @Column({ type: 'varchar', length: 255 })
  descripcion!: string;

  @ManyToOne(() => Contrato, (contrato) => contrato.obligaciones)
  @JoinColumn({ name: 'fk_contrato' })
  contrato!: Contrato;
}
