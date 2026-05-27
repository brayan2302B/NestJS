import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contratos')
export class Contrato {
  @PrimaryGeneratedColumn()
  id_contrato!: number;

  @Column({ type: 'date' })
  fecha_inicio!: Date;

  @Column({ type: 'date' })
  fecha_fin!: Date;

  @Column()
  estado!: string;

  @Column()
  fk_persona!: number;
}