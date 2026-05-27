import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('obligaciones')
export class Obligacione {
  @PrimaryGeneratedColumn()
  id_obligaciones!: number;

  @Column()
  descripcion!: string;

  @Column()
  fk_contrato!: number;
}
