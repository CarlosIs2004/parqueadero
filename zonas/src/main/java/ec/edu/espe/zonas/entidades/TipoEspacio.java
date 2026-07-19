package ec.edu.espe.zonas.entidades;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoEspacio {
    MOTO, AUTO, BUSETA;

    @JsonCreator
    public static TipoEspacio fromString(String value) {
        if (value == null) return null;
        return TipoEspacio.valueOf(value.toUpperCase().trim());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}
