import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Rol } from '../../rol/entities/rol.entity';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id_area!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'fk_rol' })
  rol!: Rol;
}