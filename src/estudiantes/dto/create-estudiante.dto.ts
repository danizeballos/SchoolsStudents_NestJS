import { IsString, MinLength, IsDateString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreateEstudianteDto {

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MinLength(3, { message: 'El apellido debe tener al menos 3 caracteres' })
  apellido: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)' })
  fechaNacimiento: string;

  @IsString({ message: 'El nombreColegio debe ser una cadena de texto' })
  @MinLength(1, { message: 'El nombreColegio es requerido' })
  nombreColegio: string;

  @IsOptional()
  @IsArray({ message: 'materia debe ser un array' })
  @IsNumber({}, { each: true, message: 'Cada id de materia debe ser un número' })
  materia?: number[];
}
