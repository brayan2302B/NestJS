import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Informe } from '../../informes/entities/informe.entity';

@Entity('informe_gf')
export class InformeGf {
  @PrimaryGeneratedColumn()
  id_gf!: number;

  @Column({ type: 'varchar', length: 50 })
  version_gf!: string;

  @ManyToOne(() => Informe)
  @JoinColumn({ name: 'fk_informe' })
  informe!: Informe;
}
