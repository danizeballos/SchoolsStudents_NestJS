import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { Materia } from './entities/materia.entity';

@Injectable()
export class MateriasService {
  constructor(
    @InjectRepository(Materia)
    private readonly materiasRepository: Repository<Materia>,
  ) {}

  private transformToResponse(materia: Materia | null) {
    if (!materia) {
      return null;
    }
    return {
      id: materia.id,
      nombre: materia.nombre,
      estudiantes: materia.estudiantes?.filter(e => !e.deletedAt).map(estudiante => ({
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
      })) || [],
    };
  }

  async create(createMateriaDto: CreateMateriaDto) {
    const materia = this.materiasRepository.create(createMateriaDto);
    const savedMateria = await this.materiasRepository.save(materia);
    
    const materiaCompleta = await this.materiasRepository.findOne({
      where: { id: savedMateria.id },
      relations: ['estudiantes']
    });

    if (!materiaCompleta) {
      throw new NotFoundException('Error al recuperar la materia creada');
    }

    return this.transformToResponse(materiaCompleta);
  }

  async findAll() {
    const materias = await this.materiasRepository.find({
      relations: ['estudiantes']
    });
    
    return materias.map(materia => this.transformToResponse(materia));
  }

  async findOne(id: string) {
    const materia = await this.materiasRepository.findOne({
      where: { id },
      relations: ['estudiantes']
    });
    
    if (!materia) {
      throw new NotFoundException(`La materia con id ${id} no existe`);
    }
    
    return this.transformToResponse(materia);
  }

  async update(id: string, updateMateriaDto: UpdateMateriaDto) {
    const materia = await this.materiasRepository.findOne({
      where: { id },
      relations: ['estudiantes']
    });
    
    if (!materia) {
      throw new NotFoundException(`La materia con id ${id} no existe`);
    }
    
    await this.materiasRepository.update(id, updateMateriaDto);
    
    const materiaActualizada = await this.materiasRepository.findOne({
      where: { id },
      relations: ['estudiantes']
    });

    if (!materiaActualizada) {
      throw new NotFoundException('Error al recuperar la materia actualizada');
    }

    return this.transformToResponse(materiaActualizada);
  }

  async remove(id: string) {
    const materia = await this.materiasRepository.findOne({
      where: { id }
    });
    if (!materia) {
      throw new NotFoundException(`La materia con id ${id} no existe`);
    }
    await this.materiasRepository.softDelete(id);
    return {
      message: `Materia con id ${id} eliminada correctamente`,
      id,
    };
  }
}
