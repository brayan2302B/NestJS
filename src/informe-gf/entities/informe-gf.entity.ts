import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('informe_gf')
export class InformeGf {

  @PrimaryGeneratedColumn()
  id_gf: number;

  @Column({ type: 'varchar', length: 50 })
  version_gf: string;

  @Column({ type: 'int', nullable: true })
  fk_informe: number;
}