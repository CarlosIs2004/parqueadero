package ec.edu.espe.zonas.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final String jwtSecret;
    private final String usuariosApiUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public JwtAuthFilter(String jwtSecret) {
        this.jwtSecret = jwtSecret;
        this.usuariosApiUrl = System.getenv("USUARIOS_API_URL");
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

            Jws<Claims> jws = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);

            Claims claims = jws.getPayload();
            String sub = claims.getSubject();
            if (sub == null) {
                sub = claims.get("sub", String.class);
            }

            // Consultar roles actuales desde el servicio de usuarios
            List<String> roles = fetchUserRoles(sub, header);

            // Si no se pudieron obtener los roles, cortar con 403 claro
            if (roles == null || roles.isEmpty()) {
                log.warn("No se encontraron roles para el usuario {} — denegando acceso", sub);
                response.sendError(HttpServletResponse.SC_FORBIDDEN,
                        "No se pudieron verificar los roles del usuario. " +
                        "Verifique que el usuario exista y tenga roles asignados.");
                return;
            }

            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(sub, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (JwtException e) {
            log.warn("JWT inválido: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            log.error("Error inesperado al procesar JWT: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private List<String> fetchUserRoles(String userId, String bearerHeader) {
        if (usuariosApiUrl == null || usuariosApiUrl.isBlank()) {
            log.warn("USUARIOS_API_URL no configurada — denegando acceso por defecto");
            return List.of();
        }

        try {
            String url = usuariosApiUrl + "/" + userId + "/roles";
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", bearerHeader)
                    .timeout(Duration.ofSeconds(3))
                    .GET()
                    .build();

            HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

            if (res.statusCode() == 200) {
                return objectMapper.readValue(res.body(), new TypeReference<List<String>>() {});
            }

            log.warn("Roles API respondió con status {} para usuario {}", res.statusCode(), userId);
        } catch (IOException e) {
            log.error("Error de conexión al consultar roles del usuario {}: {}", userId, e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Consulta de roles interrumpida para usuario {}", userId);
        } catch (Exception e) {
            log.error("Error inesperado consultando roles del usuario {}: {}", userId, e.getMessage());
        }

        return List.of();
    }
}
