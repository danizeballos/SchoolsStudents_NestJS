import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudiantesService } from './estudiantes.service';
import { EstudiantesController } from './estudiantes.controller';
import { Estudiante } from './entities/estudiante.entity';
import { ColegiosModule } from '../colegios/colegios.module';
import { Materia } from '../materias/entities/materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estudiante, Materia]),
    ColegiosModule
  ],
  controllers: [EstudiantesController],
  providers: [EstudiantesService],
})
export class EstudiantesModule {}
