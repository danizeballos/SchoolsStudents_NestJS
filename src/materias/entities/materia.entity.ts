import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, DeleteDateColumn } from "typeorm";
import { Estudiante } from "src/estudiantes/entities/estudiante.entity";
import { Exclude } from "class-transformer";

@Entity()
export class Materia {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    nombre: string;

    @DeleteDateColumn()
    @Exclude()
    deletedAt: Date;

    @ManyToMany(() => Estudiante, estudiante => estudiante.materias)
    estudiantes: Estudiante[];
}
