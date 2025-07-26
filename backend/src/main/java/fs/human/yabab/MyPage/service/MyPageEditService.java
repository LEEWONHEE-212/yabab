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
    private final String WEB_IMAGE_PREFIX = "/uploads/";

    @Autowired // Constructor injection
    public MyPageEditService(MyPageEditDAO myPageEditDAO) {
        this.myPageEditDAO = myPageEditDAO;
    }

    // Retrieve all team list from TB_TEAM table
    public List<MyPageTeamDTO> getAllTeams() {
        return myPageEditDAO.selectAllTeams();
    }

    // Retrieve full user profile information for a specific userId from TB_USER table
    // Uses the selectUserProfileById method of MyPageEditDAO.
    public MyPageEditDTO getUserProfile(String userId) {
        return myPageEditDAO.selectUserProfileById(userId);
    }

    @Transactional // Transactional processing for data modification operations
    public MyPageEditDTO updateUserProfile(String userId, MyPageEditDTO myPageEditDTO, MultipartFile profileImage) throws Exception {
        // Set userId in DTO (explicitly use userId from URL path)
        myPageEditDTO.setUserId(userId);

        // 1. Retrieve existing user profile information (to get current image path/name from DB)
        // Calls the selectUserProfileById method of MyPageEditDAO.
        MyPageEditDTO existingUserProfile = myPageEditDAO.selectUserProfileById(userId);
        if (existingUserProfile == null) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        // 2. Profile image processing
        String finalImagePath;
        String finalImageName;

        if (profileImage != null && !profileImage.isEmpty()) {
            // If a new image is uploaded: Delete existing physical file and save new image

            // Attempt to delete existing image file if it exists
            if (existingUserProfile.getUserImageName() != null && !existingUserProfile.getUserImageName().isEmpty()) {
                Path oldFilePath = Paths.get(baseUploadDir, existingUserProfile.getUserImageName());
                try {
                    Files.deleteIfExists(oldFilePath);
                    System.out.println("DEBUG: Existing profile image physical file deleted successfully: " + oldFilePath);
                } catch (IOException e) {
                    System.err.println("DEBUG: Failed to delete existing profile image physical file (file not found or permission issue): " + oldFilePath + " - " + e.getMessage());
                }
            }

            // Save new image file
            String originalFilename = profileImage.getOriginalFilename();
            String extension = ""; // Declare and initialize 'extension' here
            if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            finalImageName = UUID.randomUUID().toString() + extension; // Generate new unique filename

            Path targetDirectory = Paths.get(baseUploadDir);
            Path targetFilePath = targetDirectory.resolve(finalImageName);

            // Create upload directory if it doesn't exist
            if (!Files.exists(targetDirectory)) {
                Files.createDirectories(targetDirectory);
            }
            Files.copy(profileImage.getInputStream(), targetFilePath); // Save file

            finalImagePath = WEB_IMAGE_PREFIX; // Set web access path

            System.out.println("DEBUG: New profile image saved successfully: " + targetFilePath.toString());

        } else {
            // If no new image is uploaded:
            // Maintain image path and filename from existing user profile information (existingUserProfile).
            finalImagePath = existingUserProfile.getUserImagePath();
            finalImageName = existingUserProfile.getUserImageName();
            System.out.println("DEBUG: No new image. Retaining existing image information: " + finalImageName);
        }

        // 3. Set final image path/filename in MyPageEditDTO
        // This DTO will now contain both text information and final image information.
        myPageEditDTO.setUserImagePath(finalImagePath);
        myPageEditDTO.setUserImageName(finalImageName);

        // 4. Perform database update via MyPageEditDAO
        // Calls the updateUserProfile method of MyPageEditDAO.
        // This method updates user information (text + image) at once using the MyPageEditDTO object.
        int result = myPageEditDAO.updateUserProfile(myPageEditDTO);

        if (result == 0) {
            throw new RuntimeException("Failed to update user information. Check ID: " + userId);
        }

        // 5. If update is successful, retrieve and return the latest information from DB.
        // Calls the selectUserProfileById method of MyPageEditDAO to return a DTO reflecting the latest DB state.
        return myPageEditDAO.selectUserProfileById(userId);
    }

    @Transactional // Transactional processing for data modification operations
    public void deleteProfileImage(String userId) {
        // 1. Retrieve existing user profile information to check image filename
        // Calls the selectUserProfileById method of MyPageEditDAO.
        MyPageEditDTO existingUserProfile = myPageEditDAO.selectUserProfileById(userId);
        if (existingUserProfile == null) {
            System.err.println("DEBUG: Skipping image deletion as profile for user ID " + userId + " not found.");
            return;
        }

        // 2. Attempt to delete physical file
        if (existingUserProfile.getUserImageName() != null && !existingUserProfile.getUserImageName().isEmpty()) {
            Path oldFilePath = Paths.get(baseUploadDir, existingUserProfile.getUserImageName());
            try {
                Files.deleteIfExists(oldFilePath);
                System.out.println("DEBUG: Profile image physical file deleted successfully: " + oldFilePath);
            } catch (IOException e) {
                System.err.println("DEBUG: Failed to delete profile image physical file (file not found or permission issue): " + oldFilePath + " - " + e.getMessage());
            }
        }

        // 3. Update image path/filename to NULL in DB
        // Calls the deleteUserProfileImage method of MyPageEditDAO.
        myPageEditDAO.deleteUserProfileImage(userId);
        System.out.println("DEBUG: Profile image DB information deleted successfully (NULL update): " + userId);
    }
}
