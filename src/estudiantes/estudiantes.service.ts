import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { Estudiante } from './entities/estudiante.entity';
import { Colegio } from '../colegios/entities/colegio.entity';
import { Materia } from '../materias/entities/materia.entity';

@Injectable()
export class EstudiantesService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Colegio)
    private readonly colegioRepository: Repository<Colegio>,
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
  ) {}

  private transformToResponse(estudiante: Estudiante | null) {
    if (!estudiante) {
      return null;
    }
    return {
      id: estudiante.id,
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      fechaNacimiento: estudiante.fechaNacimiento,
      colegio: estudiante.colegio ? {
        id: estudiante.colegio.id,
        nombre: estudiante.colegio.nombre,
        direccion: estudiante.colegio.direccion,
        capacidad: estudiante.colegio.capacidad,
      } : null,
      materias: estudiante.materias?.filter(m => !m.deletedAt).map(materia => ({
        id: materia.id,
        nombre: materia.nombre,
      })) || [],
    };
  }

  async create(createEstudianteDto: CreateEstudianteDto) {
    if (!createEstudianteDto.nombreColegio) {
      throw new BadRequestException('El nombreColegio es requerido para crear un estudiante');
    }

    // Buscar el colegio por nombre (solo activos)
    const colegio = await this.colegioRepository.findOne({
      where: { nombre: createEstudianteDto.nombreColegio, deletedAt: IsNull() },
      relations: ['estudiantes']
    });

    if (!colegio) {
      throw new NotFoundException(`El colegio con nombre "${createEstudianteDto.nombreColegio}" no existe`);
    }

    // Validar capacidad del colegio
    const estudiantesActivos = colegio.estudiantes?.filter(e => !e.deletedAt) || [];
    if (estudiantesActivos.length >= colegio.capacidad) {
      throw new BadRequestException(
        `El colegio "${colegio.nombre}" ha alcanzado su capacidad máxima de ${colegio.capacidad} estudiantes`
      );
    }

    // Buscar y validar las materias si se proporcionan
    let materias: Materia[] = [];
    if (createEstudianteDto.materia && createEstudianteDto.materia.length > 0) {
      // Convertir números a strings ya que el id de Materia es string
      const materiasIdsString = createEstudianteDto.materia.map(id => String(id));
      
      materias = await this.materiaRepository.find({
        where: { id: In(materiasIdsString), deletedAt: IsNull() }
      });

      // Validar que todas las materias existen
      if (materias.length !== createEstudianteDto.materia.length) {
        const materiasEncontradas = materias.map(m => m.id);
        const materiasNoEncontradas = materiasIdsString.filter(id => !materiasEncontradas.includes(id));
        throw new NotFoundException(
          `Las siguientes materias no existen o están eliminadas: ${materiasNoEncontradas.join(', ')}`
        );
      }
    }

    const estudiante = this.estudianteRepository.create({
      nombre: createEstudianteDto.nombre,
      apellido: createEstudianteDto.apellido,
      fechaNacimiento: new Date(createEstudianteDto.fechaNacimiento),
      colegio: colegio,
      materias: materias,
    });

    const savedEstudiante = await this.estudianteRepository.save(estudiante);
    
    const estudianteCompleto = await this.estudianteRepository.findOne({
      where: { id: savedEstudiante.id },
      relations: ['colegio', 'materias']
    });

    if (!estudianteCompleto) {
      throw new NotFoundException('Error al recuperar el estudiante creado');
    }

    return this.transformToResponse(estudianteCompleto);
  }

  async findAll() {
    const estudiantes = await this.estudianteRepository.find({
      relations: ['colegio', 'materias']
    });
    
    return estudiantes.map(estudiante => this.transformToResponse(estudiante));
  }

  async findOne(id: number) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['colegio', 'materias']
    });
    
    if (!estudiante) {
      throw new NotFoundException(`El estudiante con id ${id} no existe`);
    }
    
    return this.transformToResponse(estudiante);
  }

  async update(id: number, updateEstudianteDto: UpdateEstudianteDto) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['colegio', 'materias']
    });
    
    if (!estudiante) {
      throw new NotFoundException(`El estudiante con id ${id} no existe`);
    }

    // Si se actualiza el nombreColegio, buscar y validar el nuevo colegio
    if (updateEstudianteDto.nombreColegio !== undefined && updateEstudianteDto.nombreColegio !== null) {
      const nuevoColegio = await this.colegioRepository.findOne({
        where: { nombre: updateEstudianteDto.nombreColegio, deletedAt: IsNull() },
        relations: ['estudiantes']
      });

      if (!nuevoColegio) {
        throw new NotFoundException(`El colegio con nombre "${updateEstudianteDto.nombreColegio}" no existe`);
      }

      // Validar capacidad del nuevo colegio
      const estudiantesActivos = nuevoColegio.estudiantes?.filter(
        e => !e.deletedAt && e.id !== id
      ) || [];
      
      if (estudiantesActivos.length >= nuevoColegio.capacidad) {
        throw new BadRequestException(
          `El colegio "${nuevoColegio.nombre}" ha alcanzado su capacidad máxima de ${nuevoColegio.capacidad} estudiantes`
        );
      }

      estudiante.colegio = nuevoColegio;
    }

    // Actualizar otros campos
    if (updateEstudianteDto.nombre) {
      estudiante.nombre = updateEstudianteDto.nombre;
    }
    if (updateEstudianteDto.apellido) {
      estudiante.apellido = updateEstudianteDto.apellido;
    }
    if (updateEstudianteDto.fechaNacimiento) {
      estudiante.fechaNacimiento = new Date(updateEstudianteDto.fechaNacimiento);
    }

    await this.estudianteRepository.save(estudiante);
    
    const estudianteActualizado = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['colegio', 'materias']
    });

    if (!estudianteActualizado) {
      throw new NotFoundException('Error al recuperar el estudiante actualizado');
    }

    return this.transformToResponse(estudianteActualizado);
  }

  async remove(id: number) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id }
    });
    if (!estudiante) {
      throw new NotFoundException(`El estudiante con id ${id} no existe`);
    }
    await this.estudianteRepository.softDelete(id);
    return {
      message: `Estudiante con id ${id} eliminado correctamente`,
      id,
    };
  }

  // Métodos para gestionar materias del estudiante
  async addMateria(estudianteId: number, materiaId: string) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: estudianteId },
      relations: ['materias']
    });

    if (!estudiante) {
      throw new NotFoundException(`El estudiante con id ${estudianteId} no existe`);
    }

    const materia = await this.materiaRepository.findOne({
      where: { id: materiaId, deletedAt: IsNull() }
    });
    if (!materia) {
      throw new NotFoundException(`La materia con id ${materiaId} no existe`);
    }

    // Verificar si ya tiene la materia
    if (estudiante.materias?.some(m => m.id === materiaId && !m.deletedAt)) {
      throw new BadRequestException('El estudiante ya tiene esta materia asignada');
    }

    // Filtrar materias eliminadas y agregar la nueva
    const materiasActivas = estudiante.materias?.filter(m => !m.deletedAt) || [];
    estudiante.materias = [...materiasActivas, materia];
    await this.estudianteRepository.save(estudiante);

    const estudianteActualizado = await this.estudianteRepository.findOne({
      where: { id: estudianteId },
      relations: ['colegio', 'materias']
    });

    if (!estudianteActualizado) {
      throw new NotFoundException('Error al recuperar el estudiante actualizado');
    }

    return this.transformToResponse(estudianteActualizado);
  }

  async removeMateria(estudianteId: number, materiaId: string) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: estudianteId },
      relations: ['materias']
    });

    if (!estudiante) {
      throw new NotFoundException(`El estudiante con id ${estudianteId} no existe`);
    }

    // Filtrar la materia específica (mantener las demás)
    estudiante.materias = estudiante.materias?.filter(m => m.id !== materiaId) || [];
    await this.estudianteRepository.save(estudiante);

    const estudianteActualizado = await this.estudianteRepository.findOne({
      where: { id: estudianteId },
      relations: ['colegio', 'materias']
    });

    if (!estudianteActualizado) {
      throw new NotFoundException('Error al recuperar el estudiante actualizado');
    }

    return this.transformToResponse(estudianteActualizado);
  }
}
