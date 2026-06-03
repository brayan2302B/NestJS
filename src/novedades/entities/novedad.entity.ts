import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Version } from '../../versiones/entities/version.entity';
import { Persona } from '../../personas/entities/persona.entity';

@Entity('novedades')
export class Novedad {
  @PrimaryGeneratedColumn()
  id_novedad!: number;

  @Column({ type: 'varchar', length: 255 })
  descripcion!: string;

  @Column({ type: 'date' })
  fecha_novedad!: Date;

  @Column({ type: 'varchar', length: 50, default: 'activo' })
  estado!: string;

  @ManyToOne(() => Version)
  @JoinColumn({ name: 'fk_version' })
  version!: Version;

  @ManyToOne(() => Persona, (persona) => persona.novedades)
  @JoinColumn({ name: 'fk_persona' })
  persona!: Persona;
}
export class Novedade {}
