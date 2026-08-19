import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn({ name: 'id_area' })
  id_area!: number;

  @Column({ name: 'nombre_area', type: 'varchar', length: 100, unique: true })
  nombre_area!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
