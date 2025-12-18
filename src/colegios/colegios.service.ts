import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateColegioDto } from './dto/create-colegio.dto';
import { UpdateColegioDto } from './dto/update-colegio.dto';
import { Colegio } from './entities/colegio.entity';
import { Estudiante } from '../estudiantes/entities/estudiante.entity';

@Injectable()
export class ColegiosService {
  constructor(
    @InjectRepository(Colegio)
    private readonly colegioRepository: Repository<Colegio>,
  ) { }

  private transformEstudiantes(estudiantes: Estudiante[] | undefined): Array<{
    id: number;
    nombre: string;
    apellido: string;
    fechaNacimiento: Date;
  }> {
    if (!estudiantes || estudiantes.length === 0) return [];
    return estudiantes
      .filter(e => !e.deletedAt)
      .map(estudiante => ({
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        fechaNacimiento: estudiante.fechaNacimiento,
      }));
  }

  private transformToResponse(colegio: Colegio | null) {
    if (!colegio) {
      return null;
    }
    return {
      id: colegio.id,
      nombre: colegio.nombre,
      direccion: colegio.direccion,
      capacidad: colegio.capacidad,
      estudiantes: this.transformEstudiantes(colegio.estudiantes),
    };
  }

  async create(createColegioDto: CreateColegioDto) {
    const colegio = this.colegioRepository.create(createColegioDto);
    const savedColegio = await this.colegioRepository.save(colegio);
    
    const colegioCompleto = await this.colegioRepository.findOne({
      where: { id: savedColegio.id },
      relations: ['estudiantes']
    });

    if (!colegioCompleto) {
      throw new NotFoundException('Error al recuperar el colegio creado');
    }

    return this.transformToResponse(colegioCompleto);
  }

  async findAll() {
    const colegios = await this.colegioRepository.find({
      relations: ['estudiantes']
    });
    
    return colegios.map(colegio => this.transformToResponse(colegio));
  }

  async findOne(id: number) {
    const colegio = await this.colegioRepository.findOne({
      where: { id },
      relations: ['estudiantes']
    });
    
    if (!colegio) {
      throw new NotFoundException(`El colegio con id ${id} no existe`);
    }
    
    return this.transformToResponse(colegio);
  }

  async update(id: number, updateColegioDto: UpdateColegioDto) {
    const colegio = await this.colegioRepository.findOne({
      where: { id },
      relations: ['estudiantes']
    });
    
    if (!colegio) {
      throw new NotFoundException(`El colegio con id ${id} no existe`);
    }

    // Si se actualiza la capacidad, validar que no sea menor que estudiantes actuales
    if (updateColegioDto.capacidad !== undefined) {
      const estudiantesActivos = colegio.estudiantes?.filter(e => !e.deletedAt) || [];
      if (updateColegioDto.capacidad < estudiantesActivos.length) {
        throw new BadRequestException(
          `La capacidad no puede ser menor que el número de estudiantes actuales (${estudiantesActivos.length})`
        );
      }
      if (updateColegioDto.capacidad <= 0) {
        throw new BadRequestException('La capacidad debe ser un número positivo');
      }
    }

    await this.colegioRepository.update(id, updateColegioDto);
    
    const colegioActualizado = await this.colegioRepository.findOne({
      where: { id },
      relations: ['estudiantes']
    });

    if (!colegioActualizado) {
      throw new NotFoundException('Error al recuperar el colegio actualizado');
    }

    return this.transformToResponse(colegioActualizado);
  }

  async remove(id: number) {
    const colegio = await this.colegioRepository.findOne({
      where: { id }
    });
    if (!colegio) {
      throw new NotFoundException(`El colegio con id ${id} no existe`);
    }
    await this.colegioRepository.softDelete(id);
    return {
      message: `Colegio con id ${id} eliminado correctamente`,
      id,
    };
  }
}
