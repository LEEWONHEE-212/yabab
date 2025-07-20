package fs.human.yabab.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())   //  CSRF 비활성화 (프론트 연동 시)
                .cors(cors -> {})   //  WebMvcConfigurer에서 정의된 CORS 설정 적용
                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/auth/**").permitAll()    //  회원가입, 인증 등 열기
//                        .anyRequest().authenticated()   //  나머지는 인증 필요
                        .anyRequest().permitAll()   //  모든 요청 허용
                )
                .build();
    }
}
