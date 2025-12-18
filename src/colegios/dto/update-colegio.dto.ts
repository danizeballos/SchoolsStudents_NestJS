import { PartialType } from '@nestjs/mapped-types';
import { CreateColegioDto } from './create-colegio.dto';
import { IsString, MinLength, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class UpdateColegioDto extends PartialType(CreateColegioDto) {

  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @IsPositive({ message: 'La capacidad debe ser un número positivo' })
  capacidad?: number;
}
