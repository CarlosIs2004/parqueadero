package ec.edu.espe.zonas;

import ec.edu.espe.zonas.entidades.Espacio;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.TipoEspacio;
import ec.edu.espe.zonas.entidades.TipoZona;
import ec.edu.espe.zonas.entidades.Zona;
import ec.edu.espe.zonas.repositorios.EspacioRepositorio;
import ec.edu.espe.zonas.repositorios.ZonaRepositorio;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ZonaRepositorio zonaRepo;
    private final EspacioRepositorio espacioRepo;

    @Override
    public void run(String... args) {
        if (zonaRepo.count() > 0) {
            log.info("Ya existen zonas en la BD, se omite el seed");
            return;
        }

        log.info("=== Iniciando seed de datos predeterminados ===");

        // ── Zona VIP ──
        Zona zonaVip = Zona.builder()
                .nombre("VIP")
                .descripcion("Zona VIP exclusiva — solo vehículos autorizados")
                .codigo("VIP-01")
                .estado(1)
                .capacidad(5)
                .tipo(TipoZona.VIP)
                .fechaCreacion(LocalDateTime.now())
                .build();

        List<Espacio> espaciosVip = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            espaciosVip.add(Espacio.builder()
                    .codigo("VIP-A-" + String.format("%02d", i))
                    .descripcion("Espacio VIP nivel " + i)
                    .tipo(TipoEspacio.AUTO)
                    .activo(true)
                    .estado(EstadoEspacio.DISPONIBLE)
                    .zona(zonaVip)
                    .fechaCreacion(LocalDateTime.now())
                    .build());
        }
        zonaVip.setEspacios(espaciosVip);
        zonaRepo.save(zonaVip);
        log.info("Zona VIP creada con {} espacios", espaciosVip.size());

        // ── Zona Regular ──
        Zona zonaRegular = Zona.builder()
                .nombre("Parqueadero General")
                .descripcion("Zona de estacionamiento general para todo tipo de vehículos")
                .codigo("REG-01")
                .estado(1)
                .capacidad(10)
                .tipo(TipoZona.REGULAR)
                .fechaCreacion(LocalDateTime.now())
                .build();

        List<Espacio> espaciosReg = new ArrayList<>();
        // 5 espacios para autos
        for (int i = 1; i <= 5; i++) {
            espaciosReg.add(Espacio.builder()
                    .codigo("REG-A-" + String.format("%02d", i))
                    .descripcion("Espacio para auto #" + i)
                    .tipo(TipoEspacio.AUTO)
                    .activo(true)
                    .estado(EstadoEspacio.DISPONIBLE)
                    .zona(zonaRegular)
                    .fechaCreacion(LocalDateTime.now())
                    .build());
        }
        // 3 espacios para motos
        for (int i = 1; i <= 3; i++) {
            espaciosReg.add(Espacio.builder()
                    .codigo("REG-M-" + String.format("%02d", i))
                    .descripcion("Espacio para moto #" + i)
                    .tipo(TipoEspacio.MOTO)
                    .activo(true)
                    .estado(EstadoEspacio.DISPONIBLE)
                    .zona(zonaRegular)
                    .fechaCreacion(LocalDateTime.now())
                    .build());
        }
        // 2 espacios para busetas/camionetas
        for (int i = 1; i <= 2; i++) {
            espaciosReg.add(Espacio.builder()
                    .codigo("REG-B-" + String.format("%02d", i))
                    .descripcion("Espacio para buseta/camión #" + i)
                    .tipo(TipoEspacio.BUSETA)
                    .activo(true)
                    .estado(EstadoEspacio.DISPONIBLE)
                    .zona(zonaRegular)
                    .fechaCreacion(LocalDateTime.now())
                    .build());
        }
        zonaRegular.setEspacios(espaciosReg);
        zonaRepo.save(zonaRegular);
        log.info("Zona Regular creada con {} espacios", espaciosReg.size());

        log.info("=== Seed completado: {} zonas, {} espacios ===",
                zonaRepo.count(), espacioRepo.count());
    }
}
