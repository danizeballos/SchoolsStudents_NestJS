import { IsEmail, IsString, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class RegisterDto {
    @IsString()
    @MinLength(1)
    nombre: string;

    @IsEmail()
    email: string

    @IsString()
    @MinLength(6)
    @Transform(({ value }) => value.trim())
    password: string
}

