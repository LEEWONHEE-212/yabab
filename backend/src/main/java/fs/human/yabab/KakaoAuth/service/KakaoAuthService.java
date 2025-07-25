package fs.human.yabab.KakaoAuth.service;

import fs.human.yabab.KakaoAuth.dao.UserMapper;
import fs.human.yabab.KakaoAuth.vo.KakaoTokenResponse;
import fs.human.yabab.KakaoAuth.vo.KakaoUserInfoResponse;
import fs.human.yabab.KakaoAuth.vo.UserLoginResponse;
import fs.human.yabab.KakaoAuth.vo.KakaoAuthUserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional; // Transactional 어노테이션 임포트

import java.util.UUID;

@Service
public class KakaoAuthService {

    @Value("${kakao.rest.api.key}")
    private String kakaoRestApiKey;

    @Value("${kakao.redirect.uri}")
    private String kakaoRedirectUri;

    @Value("${kakao.token.url}")
    private String kakaoTokenUrl;

    @Value("${kakao.user.info.url}")
    private String kakaoUserInfoUrl;

    private final RestTemplate restTemplate;
    private final UserMapper userMapper;

    @Autowired
    public KakaoAuthService(RestTemplate restTemplate, UserMapper userMapper) {
        this.restTemplate = restTemplate;
        this.userMapper = userMapper;
    }

    @Transactional // kakaoLogin 메서드에 @Transactional 추가
    public UserLoginResponse kakaoLogin(String code) {
        KakaoTokenResponse tokenResponse = getKakaoAccessToken(code);
        if (tokenResponse == null || tokenResponse.getAccessToken() == null) {
            throw new IllegalArgumentException("Failed to get Kakao access token.");
        }

        KakaoUserInfoResponse userInfo = getKakaoUserInfo(tokenResponse.getAccessToken());
        if (userInfo == null || userInfo.getId() == null) {
            throw new IllegalArgumentException("Failed to get Kakao user info.");
        }

        return processUserLogin(userInfo);
    }

    private KakaoTokenResponse getKakaoAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoRestApiKey);
        params.add("redirect_uri", kakaoRedirectUri);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<KakaoTokenResponse> response = restTemplate.exchange(
                    kakaoTokenUrl,
                    HttpMethod.POST,
                    kakaoTokenRequest,
                    KakaoTokenResponse.class
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Error getting Kakao access token: " + e.getMessage());
            return null;
        }
    }

    private KakaoUserInfoResponse getKakaoUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        HttpEntity<MultiValueMap<String, String>> kakaoProfileRequest = new HttpEntity<>(headers);

        try {
            ResponseEntity<KakaoUserInfoResponse> response = restTemplate.exchange(
                    kakaoUserInfoUrl,
                    HttpMethod.POST,
                    kakaoProfileRequest,
                    KakaoUserInfoResponse.class
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Error getting Kakao user info: " + e.getMessage());
            return null;
        }
    }

    private UserLoginResponse processUserLogin(KakaoUserInfoResponse userInfo) {
        String socialId = "KAKAO_" + userInfo.getId();
        System.out.println("DEBUG: [processUserLogin] Attempting to find user with socialId: " + socialId);
        KakaoAuthUserVO user = userMapper.findByUserId(socialId);

        if (user == null) {
            System.out.println("DEBUG: [processUserLogin] User with socialId " + socialId + " NOT found in DB. Proceeding with new user registration.");
            KakaoAuthUserVO newUser = new KakaoAuthUserVO();
            newUser.setUserId(socialId);
            newUser.setUserPassword(UUID.randomUUID().toString());

            String userName = "카카오 사용자";
            String userEmail = null;

            if (userInfo.getKakaoAccount() != null) {
                if (userInfo.getKakaoAccount().getProfile() != null) {
                    userName = userInfo.getKakaoAccount().getProfile().getNickname();
                }
                userEmail = userInfo.getKakaoAccount().getEmail();
            }

            if (userEmail == null || userEmail.isEmpty()) {
                newUser.setUserEmail("kakao_" + userInfo.getId() + "@yabab.com");
                System.out.println("DEBUG: [processUserLogin] Kakao email was null or empty. Using placeholder email: " + newUser.getUserEmail());
            } else {
                newUser.setUserEmail(userEmail);
                System.out.println("DEBUG: [processUserLogin] Kakao email received: " + newUser.getUserEmail());
            }

            newUser.setUserName(userName);
            newUser.setUserNickname(userName); // USER_NICKNAME 필드에 userName 값 설정

            System.out.println("DEBUG: [processUserLogin] Attempting to register new user: " + newUser.getUserId());

            try {
                userMapper.insertUser(newUser);
                user = userMapper.findByUserId(socialId); // 삽입 후 다시 조회하여 최신 정보 가져옴
                System.out.println("DEBUG: [processUserLogin] New Kakao user registered successfully: " + newUser.getUserId());
            } catch (Exception e) {
                System.err.println("ERROR: [processUserLogin] Failed to insert new Kakao user: " + newUser.getUserId() + ". Error: " + e.getMessage());
                throw new RuntimeException("Failed to register new Kakao user due to database error: " + e.getMessage(), e);
            }

        } else {
            System.out.println("DEBUG: [processUserLogin] Existing Kakao user found: " + user.getUserId() + ". Logging in.");
        }

        String serviceToken = "SERVICE_TOKEN_FOR_" + user.getUserId();
        // 여기가 핵심입니다: UserLoginResponse에 KakaoAuthUserVO 객체와 토큰을 함께 반환
        return new UserLoginResponse(user, serviceToken); // <-- 이 부분이 이렇게 되어 있는지 확인!
    }
}