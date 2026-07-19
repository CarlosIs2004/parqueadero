package ec.edu.espe.zonas.entidades;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EstadoEspacio {
    DISPONIBLE, OCUPADO, INACTIVO;

    @JsonCreator
    public static EstadoEspacio fromString(String value) {
        if (value == null) return null;
        return EstadoEspacio.valueOf(value.toUpperCase().trim());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}
