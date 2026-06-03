import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Contrato } from '../../contratos/entities/contrato.entity';
import { Informe } from '../../informes/entities/informe.entity';

@Entity('obligaciones')
export class Obligacione {
  @PrimaryGeneratedColumn()
  id_obligaciones!: number;

  @Column({ type: 'varchar', length: 255 })
  descripcion!: string;

  @ManyToOne(() => Contrato, (contrato) => contrato.obligaciones)
  @JoinColumn({ name: 'fk_contrato' })
  contrato!: Contrato;

  @OneToMany(() => Informe, (informe) => informe.obligacion)
  informes!: Informe[];
}
