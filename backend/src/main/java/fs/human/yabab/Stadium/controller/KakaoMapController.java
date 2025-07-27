package fs.human.yabab.Stadium.controller;

import fs.human.yabab.Stadium.service.KakaoMapService;
import fs.human.yabab.Stadium.vo.KakaoMapDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/kakaomap") // 이 컨트롤러의 기본 URL 경로 설정
@CrossOrigin(origins = "http://localhost:3000")
public class KakaoMapController {
    @Autowired // KakaoMapService 주입
    private KakaoMapService kakaoMapService;

    @Value("${kakao.map.api.key}")
    private String kakaoAppKey;

    @GetMapping("/kakao-map-key") // 이 경로가 "/kakao-map-key" 부분입니다.
    public ResponseEntity<Map<String, String>> getKakaoMapKey() {
        Map<String, String> response = new HashMap<>();
        response.put("kakaoAppKey", kakaoAppKey);
        return ResponseEntity.ok(response);
    }
    // 경기장 위치 정보를 제공하는 새로운 엔드포인트 추가
    @GetMapping("/stadium/{stadiumId}/location")
    public ResponseEntity<KakaoMapDTO> getStadiumLocation(@PathVariable("stadiumId") Long stadiumId) {
        KakaoMapDTO stadiumInfo = kakaoMapService.getStadiumLocation(stadiumId);

        if (stadiumInfo != null) {
            return ResponseEntity.ok(stadiumInfo);
        } else {
            // 해당 ID의 경기장 정보를 찾을 수 없는 경우 404 Not Found 반환
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}