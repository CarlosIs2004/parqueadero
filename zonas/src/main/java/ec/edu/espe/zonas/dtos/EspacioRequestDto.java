package ec.edu.espe.zonas.dtos;

import java.util.UUID;

import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.TipoEspacio;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para crear o actualizar un espacio")
public class EspacioRequestDto {

    @Schema(description = "Código opcional del espacio", example = "ESP-001")
    private String codigo;

    @Schema(description = "ID de la zona a la que pertenece", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    private UUID idZona;

    @Schema(description = "Descripción opcional", example = "Espacio cercano al ascensor")
    private String descripcion;
    
    @Schema(description = "Tipo de espacio", example = "ESTANDAR")
    @Enumerated(EnumType.STRING)
    @NotNull(message = "El tipo de espacio es obligatorio")
    private TipoEspacio tipo;

    @Schema(description = "Estado inicial del espacio", example = "DISPONIBLE")
    @Enumerated(EnumType.STRING)
    private EstadoEspacio estado;

}
