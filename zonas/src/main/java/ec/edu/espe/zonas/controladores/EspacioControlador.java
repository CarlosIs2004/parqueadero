package ec.edu.espe.zonas.controladores;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ec.edu.espe.zonas.dtos.EspacioRequestDto;
import ec.edu.espe.zonas.dtos.EspacioResponseDto;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.services.EspacioServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/espacios")
@RequiredArgsConstructor
@Tag(name = "Espacios", description = "CRUD de espacios de estacionamiento")
@SecurityRequirement(name = "bearerAuth")
public class EspacioControlador {

    private final EspacioServicio espacioServicio; 

    @Operation(summary = "Listar todos los espacios")
    @ApiResponse(responseCode = "200", description = "Lista de espacios obtenida correctamente")
    @GetMapping
    public ResponseEntity<List<EspacioResponseDto>> listarEspacios() {
        return ResponseEntity.ok(espacioServicio.obtenerEspacios());
    }

    @Operation(summary = "Obtener un espacio por ID")
    @ApiResponse(responseCode = "200", description = "Espacio encontrado")
    @ApiResponse(responseCode = "404", description = "Espacio no encontrado")
    @GetMapping("/{idEspacio}")
    public ResponseEntity<EspacioResponseDto> obtenerEspacio(@PathVariable UUID idEspacio) {
        return ResponseEntity.ok(espacioServicio.obtenerEspacioPorId(idEspacio));
    }

    @Operation(summary = "Crear un nuevo espacio")
    @ApiResponse(responseCode = "201", description = "Espacio creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @PostMapping
    public ResponseEntity<EspacioResponseDto> crearEspacio(
            @Valid @RequestBody EspacioRequestDto request) {
        return new ResponseEntity<>(espacioServicio.crearEspacio(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Actualizar un espacio existente")
    @ApiResponse(responseCode = "200", description = "Espacio actualizado correctamente")
    @ApiResponse(responseCode = "404", description = "Espacio no encontrado")
    @PutMapping("/{idEspacio}")
    public ResponseEntity<EspacioResponseDto> actualizarEspacio(
            @PathVariable UUID idEspacio,
            @Valid @RequestBody EspacioRequestDto request) {
        return ResponseEntity.ok(espacioServicio.actualizarEspacio(idEspacio, request));
    }

    @Operation(summary = "Eliminar un espacio (desactivación lógica)")
    @ApiResponse(responseCode = "204", description = "Espacio eliminado correctamente")
    @ApiResponse(responseCode = "404", description = "Espacio no encontrado")
    @DeleteMapping("/{idEspacio}")
    public ResponseEntity<Void> eliminarEspacio(@PathVariable UUID idEspacio) {
        espacioServicio.eliminarEspacio(idEspacio);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Cambiar el estado de un espacio")
    @ApiResponse(responseCode = "200", description = "Estado cambiado correctamente")
    @ApiResponse(responseCode = "404", description = "Espacio no encontrado")
    @PatchMapping("/{idEspacio}/estado")
    public ResponseEntity<EspacioResponseDto> cambiarEstado(
            @PathVariable UUID idEspacio,
            @RequestParam EstadoEspacio estado) {
        return ResponseEntity.ok(espacioServicio.cambiarEstado(idEspacio, estado));
    }

    @Operation(summary = "Obtener espacios por estado")
    @ApiResponse(responseCode = "200", description = "Lista filtrada obtenida correctamente")
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<EspacioResponseDto>> obtenerPorEstado(
            @PathVariable EstadoEspacio estado) {
        return ResponseEntity.ok(espacioServicio.obtenerEspaciosPorEstado(estado));
    }

    @Operation(summary = "Obtener espacios por zona y estado")
    @ApiResponse(responseCode = "200", description = "Lista filtrada obtenida correctamente")
    @GetMapping("/zona/{idZona}/estado/{estado}")
    public ResponseEntity<List<EspacioResponseDto>> obtenerPorZonaYEstado(
            @PathVariable UUID idZona,
            @PathVariable EstadoEspacio estado) {
        return ResponseEntity.ok(espacioServicio.obtenerEspaciosPorZonaEstado(idZona, estado));
    }

}
