import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Persona } from '../../personas/entities/persona.entity';
import { Obligacione } from '../../obligaciones/entities/obligacione.entity';

@Entity('contratos')
export class Contrato {
  @PrimaryGeneratedColumn()
  id_contrato!: number;

  @Column({ type: 'date' })
  fecha_inicio!: Date;

  @Column({ type: 'date' })
  fecha_fin!: Date;

  @Column({ type: 'varchar', length: 50 })
  estado!: string;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'fk_persona' })
  persona!: Persona;

  @OneToMany(() => Obligacione, (obligacion) => obligacion.contrato)
  obligaciones!: Obligacione[];
}
