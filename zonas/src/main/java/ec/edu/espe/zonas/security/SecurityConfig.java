package ec.edu.espe.zonas.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final String jwtSecret;

    public SecurityConfig() {
        this.jwtSecret = System.getenv("JWT_SECRET");
        if (this.jwtSecret == null || this.jwtSecret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET environment variable is required");
        }
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ─── Zonas: GET público (dashboard), CRUD para admin ───
                .requestMatchers(HttpMethod.GET, "/api/v1/zonas/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/zonas/**").hasRole("admin")
                .requestMatchers(HttpMethod.PUT, "/api/v1/zonas/**").hasRole("admin")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/zonas/**").hasRole("admin")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/zonas/**").hasAnyRole("admin", "root")

                // ─── Espacios: GET público (dashboard), CRUD para admin ───
                .requestMatchers(HttpMethod.GET, "/api/v1/espacios/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/espacios/**").hasRole("admin")
                .requestMatchers(HttpMethod.PUT, "/api/v1/espacios/**").hasRole("admin")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/espacios/**").hasRole("admin")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/espacios/**").hasAnyRole("admin", "root")

                // ─── Swagger/OpenAPI: público ───
                .requestMatchers("/api/swagger/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()

                // ─── Error pages: público (evita 403 por redirección interna) ───
                .requestMatchers("/error").permitAll()

                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtAuthFilter(jwtSecret),
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
