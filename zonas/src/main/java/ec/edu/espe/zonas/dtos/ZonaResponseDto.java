package ec.edu.espe.zonas.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import ec.edu.espe.zonas.entidades.Espacio;
import ec.edu.espe.zonas.entidades.TipoZona;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "DTO con los datos completos de una zona")
public class ZonaResponseDto {
    @Schema(description = "ID único de la zona", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    private UUID idZona;

    @Schema(description = "Nombre de la zona", example = "Parqueadero Norte")
    private String nombre;

    @Schema(description = "Código único generado automáticamente", example = "ZNA-001")
    private String codigo;

    @Schema(description = "Descripción de la zona", example = "Zona para vehículos livianos")
    private String descripcion;

    @Schema(description = "Estado: 1=activo, 0=inactivo", example = "1")
    private int estado;

    @Schema(description = "Tipo de zona")
    private TipoZona tipo;

    @Schema(description = "Capacidad máxima", example = "50")
    private int capacidad;

    @JsonIgnoreProperties("zona")
    @Schema(description = "Lista de espacios pertenecientes a la zona")
    private List<Espacio> espacios;

    @Schema(description = "Fecha de creación", example = "2026-01-15T10:30:00")
    private LocalDateTime fechaCreacion;

    @Schema(description = "Fecha de última modificación")
    private LocalDateTime fechaModificacion;

}
