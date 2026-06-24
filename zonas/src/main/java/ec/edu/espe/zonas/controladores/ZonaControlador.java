package ec.edu.espe.zonas.controladores;

import ec.edu.espe.zonas.dtos.ZonaRequestDto;
import ec.edu.espe.zonas.dtos.ZonaResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ec.edu.espe.zonas.services.ZonaServicio;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequestMapping("/api/v1/zonas")
@RequiredArgsConstructor
@Tag(name = "Zonas", description = "CRUD de zonas de estacionamiento")
public class ZonaControlador {

    private final ZonaServicio zonaServicio;

    @Operation(summary = "Listar todas las zonas")
    @ApiResponse(responseCode = "200", description = "Lista de zonas obtenida correctamente")
    @GetMapping
    public ResponseEntity<List<ZonaResponseDto>> listarZonas(){
        return ResponseEntity.ok(zonaServicio.listarZonas());
    }

    @Operation(summary = "Crear una nueva zona")
    @ApiResponse(responseCode = "201", description = "Zona creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @PostMapping
    public ResponseEntity<ZonaResponseDto> crearZona(
            @Valid @RequestBody ZonaRequestDto request) {
        return new ResponseEntity<>(zonaServicio.crearZona(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Actualizar una zona existente")
    @ApiResponse(responseCode = "200", description = "Zona actualizada correctamente")
    @ApiResponse(responseCode = "404", description = "Zona no encontrada")
    @PutMapping("/{idZona}")
    public ResponseEntity<ZonaResponseDto> actualizarZona(
            @PathVariable UUID idZona,
            @Valid @RequestBody ZonaRequestDto request) {
        return ResponseEntity.ok(zonaServicio.actualizarZona(idZona, request));
    }
    
    @Operation(summary = "Activar o desactivar una zona (toggle)")
    @ApiResponse(responseCode = "204", description = "Estado cambiado correctamente")
    @ApiResponse(responseCode = "404", description = "Zona no encontrada")
    @PatchMapping("/{idZona}/estado")
    public ResponseEntity<Void> activarDesactivar(@PathVariable UUID idZona) {
        zonaServicio.activarDesactivar(idZona);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Eliminar una zona")
    @ApiResponse(responseCode = "204", description = "Zona eliminada correctamente")
    @ApiResponse(responseCode = "404", description = "Zona no encontrada")
    @DeleteMapping("/{idZona}")
    public ResponseEntity<Void> eliminarZona(@PathVariable UUID idZona) {
        zonaServicio.eliminarZona(idZona);
        return ResponseEntity.noContent().build();
    }

}
