package fs.human.yabab.MyPage.service;

import fs.human.yabab.MyPage.dao.MyPageEditDAO;
import fs.human.yabab.MyPage.vo.MyPageEditDTO;
import fs.human.yabab.MyPage.vo.MyPageTeamDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class MyPageEditService {
    private final MyPageEditDAO myPageEditDAO;


    // 이미지 업로드 물리적 경로 (application.properties 또는 application.yml에 설정)
    @Value("${upload.uploads.image.dir}")
    private String baseUploadDir;

    // 웹 접근 경로 접두사 (프론트엔드에서 이미지를 요청할 때 사용)
    // ⭐ 이 부분을 "/uploads/"로 변경해야 합니다. ⭐
    private final String WEB_IMAGE_PREFIX = "/uploads/"; // <--- 이 부분을 수정하세요!

    @Autowired // Constructor injection
    public MyPageEditService(MyPageEditDAO myPageEditDAO) {
        this.myPageEditDAO = myPageEditDAO;
    }

    // Retrieve all team list from TB_TEAM table
    @Transactional(readOnly = true)
    public List<MyPageTeamDTO> getAllTeams() {
        return myPageEditDAO.selectAllTeams();
    }

    // Retrieve full user profile information for a specific userId from TB_USER table
    @Transactional(readOnly = true)
    public MyPageEditDTO getUserProfile(String userId) {
        return myPageEditDAO.selectUserProfileById(userId);
    }

    @Transactional // Transactional processing for data modification operations
    public MyPageEditDTO updateUserProfile(String userId, MyPageEditDTO myPageEditDTO, MultipartFile profileImage) throws Exception {
        // Set userId in DTO (explicitly use userId from URL path)
        myPageEditDTO.setUserId(userId);

        // 1. Retrieve existing user profile information (to get current image path/name from DB)
        MyPageEditDTO existingUserProfile = myPageEditDAO.selectUserProfileById(userId);
        if (existingUserProfile == null) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }

        // 2. Profile image processing
        String finalImagePath = existingUserProfile.getUserImagePath(); // 기본값: 기존 경로
        String finalImageName = existingUserProfile.getUserImageName(); // 기본값: 기존 이름

        if (profileImage != null && !profileImage.isEmpty()) {
            // 새 이미지 업로드 시: 기존 물리 파일 삭제 후 새 이미지 저장
            if (existingUserProfile.getUserImageName() != null && !existingUserProfile.getUserImageName().isEmpty()) {
                Path oldFilePath = Paths.get(baseUploadDir, existingUserProfile.getUserImageName());
                try {
                    Files.deleteIfExists(oldFilePath);
                    System.out.println("DEBUG: Existing profile image physical file deleted successfully: " + oldFilePath);
                } catch (IOException e) {
                    System.err.println("DEBUG: Failed to delete existing profile image physical file (file not found or permission issue): " + oldFilePath + " - " + e.getMessage());
                    // 파일 삭제 실패해도 업데이트는 진행 (DB 정보만 변경)
                }
            }

            // 새 이미지 저장
            String originalFilename = profileImage.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            finalImageName = UUID.randomUUID().toString() + extension; // 고유한 새 파일명 생성

            Path targetDirectory = Paths.get(baseUploadDir);
            Path targetFilePath = targetDirectory.resolve(finalImageName);

            // 업로드 디렉토리가 없으면 생성
            if (!Files.exists(targetDirectory)) {
                Files.createDirectories(targetDirectory);
            }
            Files.copy(profileImage.getInputStream(), targetFilePath); // 파일 저장

            finalImagePath = WEB_IMAGE_PREFIX; // 웹 접근 경로 설정 (이제 "/uploads/"가 됩니다)

            System.out.println("DEBUG: New profile image saved successfully: " + targetFilePath.toString());

        } else {
            // 새 이미지가 업로드되지 않은 경우:
            // 프론트엔드에서 userImagePath, userImageName을 'null'로 보냈다면 (이미지 삭제 버튼 클릭 시)
            // DB에서도 NULL로 업데이트되도록 DTO에 NULL을 설정
            if (myPageEditDTO.getUserImagePath() == null && myPageEditDTO.getUserImageName() == null) {
                finalImagePath = null;
                finalImageName = null;
                // 기존 물리 파일 삭제 로직은 deleteProfileImage 메서드에서 처리됨
            }
            // 그 외의 경우 (이미지 변경 없이 다른 정보만 수정), 기존 이미지 정보 유지 (finalImagePath, finalImageName은 이미 기존 값으로 초기화됨)
            System.out.println("DEBUG: No new image. Retaining existing image information or setting to null if requested.");
        }

        // 3. 최종 이미지 경로/파일명을 MyPageEditDTO에 설정
        myPageEditDTO.setUserImagePath(finalImagePath);
        myPageEditDTO.setUserImageName(finalImageName);

        // 4. 데이터베이스 업데이트
        int result = myPageEditDAO.updateUserProfile(myPageEditDTO);

        if (result == 0) {
            throw new RuntimeException("Failed to update user information. Check ID: " + userId);
        }

        // 5. 업데이트된 최신 정보 다시 조회하여 반환
        return myPageEditDAO.selectUserProfileById(userId);
    }

    @Transactional
    public boolean deleteProfileImage(String userId) {
        MyPageEditDTO existingUserProfile = myPageEditDAO.selectUserProfileById(userId);
        if (existingUserProfile == null) {
            System.err.println("DEBUG: Skipping image deletion as profile for user ID " + userId + " not found.");
            return false; // 사용자 없음
        }

        // 1. DB에서 이미지 경로와 파일명 NULL로 업데이트
        int updatedRows = myPageEditDAO.deleteUserProfileImage(userId);

        if (updatedRows > 0) {
            // 2. 실제 파일 시스템에서 이미지 파일 삭제
            if (existingUserProfile.getUserImagePath() != null && existingUserProfile.getUserImageName() != null) {
                Path filePath = Paths.get(baseUploadDir, existingUserProfile.getUserImageName());
                try {
                    Files.deleteIfExists(filePath);
                    System.out.println("DEBUG: Profile image physical file deleted successfully: " + filePath);
                } catch (IOException e) {
                    System.err.println("DEBUG: Failed to delete profile image physical file (file not found or permission issue): " + filePath + " - " + e.getMessage());
                    // 파일 삭제 실패해도 DB 업데이트는 유지되므로, 예외를 다시 던지지 않음
                }
            }
            System.out.println("DEBUG: Profile image DB information deleted successfully (NULL update): " + userId);
            return true; // 성공
        }
        return false; // 업데이트된 행 없음 (사용자 ID 오류 또는 이미 NULL)
    }
}
