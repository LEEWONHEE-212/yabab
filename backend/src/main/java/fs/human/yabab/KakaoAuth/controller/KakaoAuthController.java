package fs.human.yabab.KakaoAuth.controller;

import fs.human.yabab.KakaoAuth.service.KakaoAuthService;
import fs.human.yabab.KakaoAuth.vo.KakaoCodeRequest;
import fs.human.yabab.KakaoAuth.vo.UserLoginResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/oauth/kakao")
@CrossOrigin(origins ="http://192.168.0.47:3000")
public class KakaoAuthController {

    private final KakaoAuthService kakaoAuthService;

    @Autowired
    public KakaoAuthController(KakaoAuthService kakaoAuthService) {
        this.kakaoAuthService = kakaoAuthService;
    }

    @PostMapping("/callback")
    public ResponseEntity<UserLoginResponse> kakaoLoginCallback(@RequestBody KakaoCodeRequest requestDto) {
        try {
            UserLoginResponse userLoginResponse = kakaoAuthService.kakaoLogin(requestDto.getCode());
            return new ResponseEntity<>(userLoginResponse, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            System.err.println("Kakao login callback error: " + e.getMessage());
            // UserLoginResponse(String errorMessage) 생성자 사용
            return new ResponseEntity<>(new UserLoginResponse(e.getMessage()), HttpStatus.BAD_REQUEST); // <-- 이 부분 수정
        } catch (Exception e) {
            System.err.println("Kakao login callback internal server error: " + e.getMessage());
            // UserLoginResponse(String errorMessage) 생성자 사용
            return new ResponseEntity<>(new UserLoginResponse("Internal server error during Kakao login"), HttpStatus.INTERNAL_SERVER_ERROR); // <-- 이 부분 수정
        }
    }
}
