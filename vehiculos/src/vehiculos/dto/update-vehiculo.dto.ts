import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

export class UpdateVehiculoDto {
    @ApiPropertyOptional({ description: 'Placa del vehículo', example: 'ABC-1234' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z]{3}-\d{4}$/, {
        message: "La placa debe tener el formato ABC-1234"
    })
    placa?: string;

    @ApiPropertyOptional({ description: 'Marca del vehículo', example: 'Toyota', minLength: 2, maxLength: 30 })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(2, {
        message: "La marca debe tener al menos 2 caracteres"
    })
    @MaxLength(30, {
        message: "La marca no debe exceder los 30 caracteres"
    })
    @Matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-#&()]+$/, {
        message: "La marca solo puede contener letras y espacios"
    })
    marca?: string;

    @ApiPropertyOptional({ description: 'Modelo del vehículo', example: 'Corolla', minLength: 2, maxLength: 150 })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(2, {
        message: "El modelo debe tener al menos 2 caracteres"
    })
    @MaxLength(150, {
        message: "El modelo no debe exceder los 150 caracteres"
    })
    @Matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-#&()]+$/, {
        message: "El modelo solo puede contener letras y espacios"
    })
    modelo?: string;

    @ApiPropertyOptional({ description: 'Color del vehículo', example: 'Rojo', minLength: 2, maxLength: 150 })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(2, {
        message: "El color debe tener al menos 2 caracteres"
    })
    @MaxLength(150, {
        message: "El color no debe exceder los 150 caracteres"
    })
    @Matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-#&()]+$/, {
        message: "El color solo puede contener letras y espacios"
    })
    color?: string;

    @ApiPropertyOptional({ description: 'Año del vehículo', example: 2024, minimum: 1885 })
    @IsOptional()
    @Min(1885, {
        message: 'El año debe ser mayor o igual a 1885',
    })
    @Max(new Date().getFullYear() + 1, {
        message: `El año no puede ser mayor a ${new Date().getFullYear() + 1}`,
    })
    @IsInt({
        message: 'El año debe ser un número entero',
    })
    anio?: number;

    @ApiPropertyOptional({ description: 'Clasificación del vehículo', enum: ['Electrico', 'Hibrido', 'Gasolina', 'Diesel'], example: 'Gasolina' })
    @IsOptional()
    @IsString()
    @IsIn(['Electrico', 'Hibrido', 'Gasolina', 'Diesel'], {
        message: 'La clasificación debe ser: Electrico, Hibrido, Gasolina o Diesel'
    })
    clasificacion?: string;

    // ── Campos específicos por tipo (opcionales) ──────────────
    @ApiPropertyOptional({ description: 'Número de puertas (auto)', example: 4, minimum: 2, maximum: 5 })
    @IsOptional()
    @IsInt({ message: "El número de puertas debe ser un número entero" })
    @Min(2, { message: "El número de puertas debe ser al menos 2" })
    @Max(5, { message: "El número de puertas no debe exceder 5" })
    numeroPuertas?: number;

    @ApiPropertyOptional({ description: 'Capacidad del maletero en litros (auto)', example: 470, minimum: 0 })
    @IsOptional()
    @IsInt({ message: "La capacidad del maletero debe ser un número entero" })
    @Min(0, { message: "La capacidad del maletero debe ser un número positivo" })
    capacidadMaletero?: number;

    @ApiPropertyOptional({ description: 'Tipo de motocicleta (moto)', enum: ['Deportivo', 'Scooter', 'Motocross'], example: 'Deportivo' })
    @IsOptional()
    @IsString()
    @Matches(/^(Deportivo|Scooter|Motocross)$/, {
        message: "El tipo de motocicleta debe ser Deportivo, Scooter o Motocross"
    })
    tipoMoto?: string;

    @ApiPropertyOptional({ description: 'Tipo de cabina (camioneta)', example: 'Simple', maxLength: 150 })
    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-#&()]+$/, {
        message: "La cabina solo puede contener letras y espacios"
    })
    cabina?: string;

    @ApiPropertyOptional({ description: 'Capacidad de carga en kg (camioneta)', example: 1500, minimum: 0, maximum: 100000 })
    @IsOptional()
    @IsInt({ message: "La capacidad de carga debe ser un número entero" })
    @Min(0, { message: "La capacidad de carga debe ser un número positivo" })
    @Max(100000, { message: "La capacidad de carga no debe exceder los 100000 kg" })
    capacidadCarga?: number;

    @ApiPropertyOptional({ description: 'Dirección MAC del cliente', example: '00:1A:2B:3C:4D:5E' })
    @IsOptional()
    @IsString()
    mac?: string;
}
