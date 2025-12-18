import { Colegio } from 'src/colegios/entities/colegio.entity';
import { Materia } from 'src/materias/entities/materia.entity';
import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  fechaNacimiento: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;

  @ManyToOne(() => Colegio, colegio => colegio.estudiantes, { nullable: true, eager: false })
  @JoinColumn({ name: 'colegioId' })
  colegio: Colegio;

  @ManyToMany(() => Materia, materia => materia.estudiantes)
  @JoinTable({
    name: 'estudiante_materia',
    joinColumn: { name: 'estudianteId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'materiaId', referencedColumnName: 'id' }
  })
  materias: Materia[];
}
