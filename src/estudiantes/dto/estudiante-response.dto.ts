import { Expose, Transform } from 'class-transformer';

export class EstudianteResponseDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;

  @Expose()
  apellido: string;

  @Expose()
  fechaNacimiento: Date;

  @Expose()
  @Transform(({ obj }) => obj.colegio?.nombre || null)
  nombreColegio: string;
}
