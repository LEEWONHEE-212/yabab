package fs.human.yabab.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.uploads.image.dir}")
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
        //  상대경로 -> 절대경로로 안전하게 변환
        String absolutePath = new File(uploadDir).getAbsolutePath();

        // 디버깅 로그: 실제 매핑될 절대 경로를 콘솔에 출력 (이 로그를 반드시 확인!)
        System.out.println("WebConfig: Mapping /uploads/** to file:" + absolutePath + "/");

        //  해당 경로에서 정적 리소스로 응답
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath + "/");

        // 기본 정적 리소스 유지
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/");
    }

    @Bean // 이 어노테이션이 중요합니다!
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}