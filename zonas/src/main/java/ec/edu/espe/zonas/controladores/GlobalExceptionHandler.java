package ec.edu.espe.zonas.controladores;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
            fieldErrors.put(fe.getField(), fe.getDefaultMessage())
        );
        body.put("fieldErrors", fieldErrors);
        body.put("message", "Error de validación en los datos enviados");

        log.warn("Error de validación: {}", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", ex.getStatusCode().value());
        body.put("error", ex.getStatusCode().toString());
        body.put("message", ex.getReason());

        log.warn("ResponseStatus: {} {}", ex.getStatusCode(), ex.getReason());
        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleJsonErrors(HttpMessageNotReadableException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");

        String message = "Error en el formato de los datos enviados";

        // Buscar en toda la cadena de causas un mensaje "No enum constant"
        Throwable cause = ex.getCause();
        while (cause != null) {
            String msg = cause.getMessage();
            if (msg != null && msg.startsWith("No enum constant")) {
                String[] parts = msg.split("\\.");
                String enumName = parts[parts.length - 1]; // ej: "PREMIUM"
                String enumType = msg.contains("TipoZona") ? "tipo" : msg.contains("TipoEspacio") ? "tipo" : msg.contains("EstadoEspacio") ? "estado" : "desconocido";
                String accepted = msg.contains("TipoZona") ? "VIP, REGULAR" : msg.contains("TipoEspacio") ? "MOTO, AUTO, BUSETA" : msg.contains("EstadoEspacio") ? "DISPONIBLE, OCUPADO, INACTIVO" : "";
                message = String.format("Valor inválido '%s' para '%s'. Valores aceptados: %s", enumName, enumType, accepted);
                break;
            }
            cause = cause.getCause();
        }

        body.put("message", message);
        log.warn("Error de serialización JSON: {}", message);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Error no esperado: {}", ex.getMessage(), ex);

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("message", "Ocurrió un error inesperado");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
