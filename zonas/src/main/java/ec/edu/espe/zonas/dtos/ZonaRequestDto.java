package ec.edu.espe.zonas.dtos;

import ec.edu.espe.zonas.entidades.TipoZona;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para crear o actualizar una zona")
public class ZonaRequestDto {
    
    @Schema(description = "Nombre de la zona", example = "Parqueadero Norte", minLength = 1, maxLength = 32)
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min =1, max = 32, message = "El nombre debe tener entre 1 y 32 caracteres")
    private String nombre;

    @Schema(description = "Descripción opcional de la zona", example = "Zona para vehículos livianos")
    private String descripcion;

    @Schema(description = "Tipo de zona", example = "AUTO")
    @Enumerated(EnumType.STRING)
    private TipoZona tipo;

    @Schema(description = "Capacidad máxima", example = "50", minimum = "1", maximum = "100")
    @Min(1)
    @Max(100)
    private int capacidad;

}
