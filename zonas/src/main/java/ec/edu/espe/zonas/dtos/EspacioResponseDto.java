package ec.edu.espe.zonas.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.TipoEspacio;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO con los datos completos de un espacio")
public class EspacioResponseDto {

    @Schema(description = "ID único del espacio", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    private UUID id;

    @Schema(description = "Código del espacio", example = "ESP-001")
    private String codigo;

    @Schema(description = "Descripción del espacio")
    private String descripcion;

    @Schema(description = "Tipo de espacio")
    private TipoEspacio tipo;

    @Schema(description = "Estado actual del espacio", example = "DISPONIBLE")
    private EstadoEspacio estado;

    @Schema(description = "Indica si está activo", example = "true")
    private boolean activo;

    @Schema(description = "ID de la zona a la que pertenece")
    private UUID idZona;

    @Schema(description = "Nombre de la zona a la que pertenece", example = "Parqueadero Norte")
    private String nombreZona;

    @Schema(description = "Fecha de creación")
    private LocalDateTime fechaCreacion;

    @Schema(description = "Fecha de última modificación")
    private LocalDateTime fechaModificacion;
    
}
