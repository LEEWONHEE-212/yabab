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
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @Value("${upload.uploads.image.dir}") // 프로필 이미지 저장 경로 (서버 물리 경로)
    private String uploadProfileImageDir;

    private final RestTemplate restTemplate;
    private final UserMapper userMapper;

    @Autowired
    public KakaoAuthService(RestTemplate restTemplate, UserMapper userMapper) {
        this.restTemplate = restTemplate;
        this.userMapper = userMapper;
    }

    @Transactional
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
        headers.add("Content-type", "application/x-x-www-form-urlencoded;charset=utf-8");

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

        KakaoAuthUserVO user = userMapper.findByUserId(socialId);

        if (user == null) {
            // 새로운 카카오 사용자 등록
            KakaoAuthUserVO newUser = new KakaoAuthUserVO();
            newUser.setUserId(socialId);
            newUser.setUserPassword(UUID.randomUUID().toString()); // 소셜 로그인 시 임의의 비밀번호

            String userName = "카카오 사용자";
            String userEmail = null;
            String kakaoProfileImageUrl = null; // 카카오에서 받은 원본 프로필 이미지 URL

            if (userInfo.getKakaoAccount() != null) {
                if (userInfo.getKakaoAccount().getProfile() != null) {
                    userName = userInfo.getKakaoAccount().getProfile().getNickname();
                    kakaoProfileImageUrl = userInfo.getKakaoAccount().getProfile().getProfileImageUrl(); // 카카오 프로필 이미지 URL 가져오기
                }
                userEmail = userInfo.getKakaoAccount().getEmail();
            }

            if (userEmail == null || userEmail.isEmpty()) {
                newUser.setUserEmail("kakao_" + userInfo.getId() + "@yabab.com");
            } else {
                newUser.setUserEmail(userEmail);
            }

            newUser.setUserName(userName);
            newUser.setUserNickname(userName); // 닉네임은 이름과 동일하게 설정 (필요시 변경)

            // --- 카카오 프로필 이미지 다운로드 및 저장 로직 (핵심 변경 부분) ---
            if (kakaoProfileImageUrl != null && !kakaoProfileImageUrl.isEmpty()) {
                try {
                    String fileName = UUID.randomUUID().toString() + ".jpg"; // 고유한 파일명 생성
                    Path uploadPath = Paths.get(uploadProfileImageDir);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath); // 디렉토리가 없으면 생성
                    }
                    Path filePath = uploadPath.resolve(fileName);

                    URL url = new URL(kakaoProfileImageUrl);
                    try (InputStream in = url.openStream();
                         FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                        byte[] buffer = new byte[1024];
                        int bytesRead;
                        while ((bytesRead = in.read(buffer)) != -1) {
                            fos.write(buffer, 0, bytesRead);
                        }
                    }
                    newUser.setUserImagePath("/uploads/"); // 웹 접근 경로 (프론트엔드에서 사용할 경로)
                    newUser.setUserImageName(fileName);
                    System.out.println("DEBUG: 카카오 프로필 이미지 저장 성공: " + filePath.toString());
                } catch (IOException e) {
                    System.err.println("DEBUG: 카카오 프로필 이미지 저장 실패: " + e.getMessage());
                    // 이미지 저장 실패 시에도 사용자 등록은 진행 (이미지 필드는 null)
                    newUser.setUserImagePath(null);
                    newUser.setUserImageName(null);
                }
            } else {
                newUser.setUserImagePath(null);
                newUser.setUserImageName(null);
            }

            newUser.setUserFavoriteTeam(null); // 초기에는 null 또는 빈 문자열로 설정. 사용자가 마이페이지에서 수정 가능.

            try {
                userMapper.insertUser(newUser);
                // 삽입 후 다시 조회하여 DB에 저장된 최신 정보 (기본값, 자동 생성된 값 등 포함)를 가져옴
                user = userMapper.findByUserId(socialId);
                System.out.println("DEBUG: [processUserLogin] New Kakao user registered: " + user.getUserId());
            } catch (Exception e) {
                System.err.println("Error registering new Kakao user: " + e.getMessage());
                throw new RuntimeException("Failed to register new Kakao user due to database error: " + e.getMessage(), e);
            }

        } else {
            // 기존 사용자 로그인: DB에서 조회된 user 객체는 이미 모든 필드를 포함하고 있음
            System.out.println("DEBUG: [processUserLogin] Existing Kakao user found: " + user.getUserId() + ". Logging in.");
            // 기존 사용자의 경우, 카카오 프로필 이미지 URL이 변경되었을 수 있으므로 업데이트 로직 추가 (선택적)
            // 이 부분은 기존 이미지를 삭제하고 새 이미지를 다운로드 받아야 하므로 좀 더 복잡해질 수 있습니다.
            // 여기서는 간단히 기존 이미지가 없고 새로운 카카오 이미지 URL이 있을 때만 업데이트하도록 예시를 듭니다.
            String currentKakaoProfileImageUrl = null;
            if (userInfo.getKakaoAccount() != null && userInfo.getKakaoAccount().getProfile() != null) {
                currentKakaoProfileImageUrl = userInfo.getKakaoAccount().getProfile().getProfileImageUrl();
            }

            // 기존 userImagePath나 userImageName이 null이고, 새로운 카카오 이미지 URL이 있다면 업데이트 시도
            if ((user.getUserImagePath() == null || user.getUserImageName() == null) && currentKakaoProfileImageUrl != null && !currentKakaoProfileImageUrl.isEmpty()) {
                try {
                    String fileName = UUID.randomUUID().toString() + ".jpg";
                    Path uploadPath = Paths.get(uploadProfileImageDir);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }
                    Path filePath = uploadPath.resolve(fileName);

                    URL url = new URL(currentKakaoProfileImageUrl);
                    try (InputStream in = url.openStream();
                         FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                        byte[] buffer = new byte[1024];
                        int bytesRead;
                        while ((bytesRead = in.read(buffer)) != -1) {
                            fos.write(buffer, 0, bytesRead);
                        }
                    }
                    user.setUserImagePath("/uploads/profile/");
                    user.setUserImageName(fileName);
                    // TODO: userMapper.updateUserImagePathAndName(user.getUserId(), user.getUserImagePath(), user.getUserImageName());
                    // 실제 DB 업데이트 로직이 필요합니다.
                    System.out.println("DEBUG: 기존 카카오 사용자 프로필 이미지 업데이트 성공: " + filePath.toString());
                } catch (IOException e) {
                    System.err.println("DEBUG: 기존 카카오 사용자 프로필 이미지 업데이트 실패: " + e.getMessage());
                }
            }
        }

        String serviceToken = "SERVICE_TOKEN_FOR_" + user.getUserId(); // 실제 JWT 토큰 생성 로직으로 대체 필요
        return new UserLoginResponse(user, serviceToken);
    }
}
