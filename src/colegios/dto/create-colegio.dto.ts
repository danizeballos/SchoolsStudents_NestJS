import { IsString, MinLength, IsNumber, IsPositive } from 'class-validator';

export class CreateColegioDto {

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  nombre: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  direccion: string;

  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @IsPositive({ message: 'La capacidad debe ser un número positivo' })
  capacidad: number;
}
