package fs.human.yabab.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.restaurant.image.dir}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")  // 프론트 주소
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);  // 쿠키 인증 필요 시 true
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // "/restaurant-images/**" 패턴으로 들어오는 웹 요청을
        // 'uploadDir' 변수에 설정된 실제 파일 시스템 경로로 매핑합니다.
        registry.addResourceHandler("/restaurant-images/**")
                .addResourceLocations("file:" + uploadDir);

        // Spring Boot의 기본 정적 자원 핸들러도 유지합니다.
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
}