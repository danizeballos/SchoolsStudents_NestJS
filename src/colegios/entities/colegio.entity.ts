import { Estudiante } from 'src/estudiantes/entities/estudiante.entity';
import { Column, Entity, PrimaryGeneratedColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Colegio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  direccion: string;

  @Column()
  capacidad: number;

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;

  @OneToMany(() => Estudiante, estudiante => estudiante.colegio)
  estudiantes: Estudiante[];
}
