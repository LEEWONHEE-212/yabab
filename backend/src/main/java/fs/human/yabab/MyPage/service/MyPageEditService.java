package fs.human.yabab.MyPage.service;

import fs.human.yabab.MyPage.dao.MyPageEditDAO;
import fs.human.yabab.MyPage.vo.MyPageEditDTO;
import fs.human.yabab.MyPage.vo.MyPageTeamDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class MyPageEditService {
    private final MyPageEditDAO myPageEditDAO;

    @Value("${upload.uploads.image.dir}")
    private String baseUploadDir;

    private final String WEB_IMAGE_PREFIX = "/restaurant-images/";

    public MyPageEditService(MyPageEditDAO myPageEditDAO) {
        this.myPageEditDAO = myPageEditDAO;
    }

    public List<MyPageTeamDTO> getAllTeams() {
        return myPageEditDAO.selectAllTeams(); // DAO 메서드 호출
    }

    public MyPageEditDTO getUserProfile(String userId) {
        // 현재 DAO 구성으로는 사용자 프로필 정보를 직접 조회할 수 없습니다.
        // 이 메서드를 호출하면 null이 반환되거나, 비즈니스 로직에 맞게 예외 처리 필요.
        return null;
    }

    @Transactional
    public MyPageEditDTO updateUserProfile(String userId, MyPageEditDTO myPageEditDTO, MultipartFile profileImage) throws Exception {
        // 1. 기본 회원 정보 업데이트
        myPageEditDTO.setUserId(userId);
        myPageEditDAO.updateUserInfo(myPageEditDTO); // DAO 메서드 호출

        // 2. 프로필 이미지 처리
        if (profileImage != null && !profileImage.isEmpty()) {
            // 기존 이미지 파일 삭제 로직 (MyPageEditDAO에 조회 메서드 부재로 인해 물리적 파일 삭제 정보 얻기 어려움)
            // 만약 기존 파일의 물리적 삭제가 필요하다면, 클라이언트에서 기존 이미지 경로/이름을 함께 보내주거나,
            // 별도의 DAO 메서드를 통해 기존 이미지 정보를 조회해야 합니다.
            // 현재는 이 로직을 생략하고 새 이미지로 DB 정보만 업데이트합니다.

            // 새 이미지 파일 저장
            String originalFilename = profileImage.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFileName = UUID.randomUUID().toString() + extension;

            // 저장될 물리적 경로: baseUploadDir + savedFileName
            // 예: /path/to/your/upload_root_directory/uuid.jpg
            Path targetDirectory = Paths.get(baseUploadDir); // 모든 파일은 baseUploadDir에 직접 저장
            Path targetFilePath = targetDirectory.resolve(savedFileName);

            // 업로드 디렉토리가 없으면 생성
            if (!Files.exists(targetDirectory)) {
                Files.createDirectories(targetDirectory);
            }

            Files.copy(profileImage.getInputStream(), targetFilePath);

            // DB에 저장될 웹 접근 가능한 경로: WEB_IMAGE_PREFIX (고정 문자열)
            // 예: /restaurant-images/
            String dbUserImagePath = WEB_IMAGE_PREFIX;

            // DB에 이미지 경로 및 파일명 업데이트
            myPageEditDAO.updateUserProfileImage(userId, dbUserImagePath, savedFileName); // DAO 메서드 호출

            // DTO에 업데이트된 이미지 정보 반영 (반환을 위해)
            myPageEditDTO.setUserImagePath(dbUserImagePath);
            myPageEditDTO.setUserImageName(savedFileName);

        } else {
            // 이미지 파일이 전송되지 않았을 경우 (기존 이미지 유지)
            // 만약 클라이언트에서 '이미지 삭제' 요청이 별도로 왔다면 deleteUserProfileImage를 호출해야 함.
        }

        // 3. 업데이트된 정보 반환
        // DAO에 조회 메서드가 없으므로, 클라이언트가 보낸 myPageEditDTO를 그대로 반환합니다.
        // 이 DTO는 최종 DB 상태와 100% 일치하지 않을 수 있습니다 (특히 파일 삭제/재업로드 관련).
        return myPageEditDTO;
    }
}
