package ec.edu.espe.zonas.entidades;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoZona {
    VIP, REGULAR;

    @JsonCreator
    public static TipoZona fromString(String value) {
        if (value == null) return null;
        return TipoZona.valueOf(value.toUpperCase().trim());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}