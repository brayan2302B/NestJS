import { Column, Entity, ManyToOne, OneToMany, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Area } from '../../areas/entities/area.entity';
import { Rol } from '../../rol/entities/rol.entity';
import { Novedad } from '../../novedades/entities/novedad.entity';

@Entity('personas')
export class Persona {
  @PrimaryGeneratedColumn()
  id_persona!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 18 })
  telefono!: string;

  @Column({ type: 'varchar', length: 100 })
  correo!: string;

  @Column({ type: 'varchar', length: 20 })
  documento!: string;

  @ManyToOne(() => Area)
  @JoinColumn({ name: 'fk_area' })
  area!: Area;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'fk_rol' })
  rol!: Rol;

  @OneToMany(() => Novedad, (novedad) => novedad.persona)
  novedades!: Novedad[];
}
