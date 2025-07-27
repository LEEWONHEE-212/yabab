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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
            String userPhone = null;
            String kakaoProfileImageUrl = null;

            if (userInfo.getKakaoAccount() != null) {
                if (userInfo.getKakaoAccount().getProfile() != null) {
                    userName = userInfo.getKakaoAccount().getProfile().getNickname();
                    kakaoProfileImageUrl = userInfo.getKakaoAccount().getProfile().getProfileImageUrl();
                }
                userEmail = userInfo.getKakaoAccount().getEmail();
                userPhone = userInfo.getKakaoAccount().getPhoneNumber();
            }

            if (userEmail == null || userEmail.isEmpty()) {
                newUser.setUserEmail("kakao_" + userInfo.getId() + "@yabab.com");
            } else {
                newUser.setUserEmail(userEmail);
            }

            newUser.setUserName(userName);
            newUser.setUserNickname(userName);

            if (userPhone != null && !userPhone.isEmpty()) {
                String normalizedPhone = userPhone.replaceAll("[^0-9]", "");
                if (normalizedPhone.startsWith("82") && normalizedPhone.length() > 2) {
                    normalizedPhone = "0" + normalizedPhone.substring(2);
                }
                newUser.setUserPhone(normalizedPhone);
                System.out.println("DEBUG: Normalized phone number: " + normalizedPhone);
            } else {
                newUser.setUserPhone(null);
            }

            if (kakaoProfileImageUrl != null && !kakaoProfileImageUrl.isEmpty()) {
                try {
                    String fileName = UUID.randomUUID().toString() + ".jpg";
                    Path uploadPath = Paths.get(uploadProfileImageDir);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
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
                    newUser.setUserImagePath("/profile_images/");
                    newUser.setUserImageName(fileName);
                    System.out.println("DEBUG: 카카오 프로필 이미지 저장 성공: " + filePath.toString());
                } catch (IOException e) {
                    System.err.println("DEBUG: 카카오 프로필 이미지 저장 실패: " + e.getMessage());
                    newUser.setUserImagePath(null);
                    newUser.setUserImageName(null);
                }
            } else {
                newUser.setUserImagePath(null);
                newUser.setUserImageName(null);
            }

            newUser.setUserFavoriteTeam(null);

            try {
                userMapper.insertUser(newUser);
                user = userMapper.findByUserId(socialId);
                System.out.println("DEBUG: [processUserLogin] New Kakao user registered: " + user.getUserId());
            } catch (Exception e) {
                System.err.println("Error registering new Kakao user: " + e.getMessage());
                throw new RuntimeException("Failed to register new Kakao user due to database error: " + e.getMessage(), e);
            }

        } else {
            // 기존 사용자 로그인: DB에서 조회된 user 객체는 이미 모든 필드를 포함하고 있음
            System.out.println("DEBUG: [processUserLogin] Existing Kakao user found: " + user.getUserId() + ". Logging in.");

            boolean needsUpdate = false;
            String currentKakaoProfileImageUrl = null;
            String currentKakaoPhoneNumber = null;

            if (userInfo.getKakaoAccount() != null) {
                if (userInfo.getKakaoAccount().getProfile() != null) {
                    currentKakaoProfileImageUrl = userInfo.getKakaoAccount().getProfile().getProfileImageUrl();
                }
                currentKakaoPhoneNumber = userInfo.getKakaoAccount().getPhoneNumber();
            }

            String normalizedCurrentKakaoPhone = null;
            if (currentKakaoPhoneNumber != null && !currentKakaoPhoneNumber.isEmpty()) {
                normalizedCurrentKakaoPhone = currentKakaoPhoneNumber.replaceAll("[^0-9]", "");
                if (normalizedCurrentKakaoPhone.startsWith("82") && normalizedCurrentKakaoPhone.length() > 2) {
                    normalizedCurrentKakaoPhone = "0" + normalizedCurrentKakaoPhone.substring(2);
                }
            }

            if ((user.getUserPhone() == null && normalizedCurrentKakaoPhone != null) ||
                    (user.getUserPhone() != null && !user.getUserPhone().equals(normalizedCurrentKakaoPhone))) {
                user.setUserPhone(normalizedCurrentKakaoPhone);
                needsUpdate = true;
                System.out.println("DEBUG: Existing user phone number updated to: " + normalizedCurrentKakaoPhone);
            }

            if (currentKakaoProfileImageUrl != null && !currentKakaoProfileImageUrl.isEmpty()) {
                boolean imageChanged = (user.getUserImagePath() == null || user.getUserImageName() == null) ||
                        !currentKakaoProfileImageUrl.endsWith(user.getUserImageName()); // URL의 끝 부분만 비교 (완벽하진 않음)

                if (imageChanged) {
                    // ⭐ 여기에 try-catch 블록 추가 ⭐
                    try {
                        if (user.getUserImageName() != null && !user.getUserImageName().isEmpty()) {
                            Path oldFilePath = Paths.get(uploadProfileImageDir, user.getUserImageName());
                            Files.deleteIfExists(oldFilePath);
                            System.out.println("DEBUG: Old profile image physical file deleted for existing user: " + oldFilePath);
                        }

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
                        user.setUserImagePath("/profile_images/");
                        user.setUserImageName(fileName);
                        needsUpdate = true;
                        System.out.println("DEBUG: Existing user profile image updated: " + filePath.toString());
                    } catch (IOException e) {
                        System.err.println("DEBUG: Existing user profile image update failed: " + e.getMessage());
                        // 이미지 업데이트 실패 시에도 사용자 정보는 계속 진행
                    }
                }
            } else {
                if (user.getUserImagePath() != null || user.getUserImageName() != null) {
                    // ⭐ 여기에 try-catch 블록 추가 ⭐
                    try {
                        if (user.getUserImageName() != null && !user.getUserImageName().isEmpty()) {
                            Path oldFilePath = Paths.get(uploadProfileImageDir, user.getUserImageName());
                            Files.deleteIfExists(oldFilePath);
                            System.out.println("DEBUG: Old profile image physical file deleted (Kakao image removed): " + oldFilePath);
                        }
                        user.setUserImagePath(null);
                        user.setUserImageName(null);
                        needsUpdate = true;
                    } catch (IOException e) {
                        System.err.println("DEBUG: Failed to delete old profile image when Kakao image is null: " + e.getMessage());
                    }
                }
            }

            if (needsUpdate) {
                try {
                    userMapper.updateUserForKakaoLogin(user);
                    System.out.println("DEBUG: Existing Kakao user DB updated: " + user.getUserId());
                } catch (Exception e) {
                    System.err.println("Error updating existing Kakao user: " + e.getMessage());
                }
            }
        }

        String serviceToken = "SERVICE_TOKEN_FOR_" + user.getUserId();
        return new UserLoginResponse(user, serviceToken);
    }
}
