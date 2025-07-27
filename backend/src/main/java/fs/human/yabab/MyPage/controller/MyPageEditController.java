package fs.human.yabab.MyPage.controller;

import fs.human.yabab.MyPage.service.MyPageEditService;
import fs.human.yabab.MyPage.vo.MyPageEditDTO;
import fs.human.yabab.MyPage.vo.MyPageTeamDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/mypage") // ⭐ 이 부분이 중요: /api/mypage로 설정되어야 합니다. ⭐
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MyPageEditController {
    private final MyPageEditService myPageEditService;

    public MyPageEditController(MyPageEditService myPageEditService){
        this.myPageEditService = myPageEditService;
    }

    /**
     * 모든 팀 목록을 조회하는 API
     * GET /api/mypage/teams
     * @return ResponseEntity<List<MyPageTeamDTO>> 팀 목록과 HTTP 상태
     */
    @GetMapping("/teams")
    public ResponseEntity<List<MyPageTeamDTO>> getAllTeams() {
        try {
            List<MyPageTeamDTO> teams = myPageEditService.getAllTeams();
            return ResponseEntity.ok(teams); // 200 OK와 함께 팀 목록 반환
        } catch (Exception e) {
            System.err.println("Error fetching teams: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
        }
    }

    /**
     * 사용자 프로필 정보를 조회합니다.
     * GET /api/mypage/profile/{userId}
     * (현재 EditProfilePage.jsx에서는 직접 호출하지 않지만, 필요할 수 있음)
     * @param userId 사용자 ID
     * @return MyPageEditDTO (200 OK) 또는 404 NOT_FOUND
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<MyPageEditDTO> getUserProfile(@PathVariable("userId") String userId) {
        try {
            MyPageEditDTO userProfile = myPageEditService.getUserProfile(userId);
            if (userProfile == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(userProfile, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching user profile for ID " + userId + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 회원 정보 및 프로필 이미지를 업데이트하는 API
     * PUT /api/mypage/profile/{userId}
     *
     * @param userId 업데이트할 회원의 ID (경로 변수)
     * @param userNickname 닉네임
     * @param userName 성명
     * @param userEmail 이메일
     * @param userPhone 전화번호
     * @param userFavoriteTeam 응원하는 팀
     * @param userImagePath 기존 이미지 경로 (새 이미지 없을 때 유지)
     * @param userImageName 기존 이미지 파일명 (새 이미지 없을 때 유지)
     * @param profileImage 업로드할 프로필 이미지 파일 (선택 사항)
     * @return ResponseEntity<MyPageEditDTO> 업데이트된 회원 정보와 HTTP 상태
     */
    @PutMapping(value = "/profile/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE) // ⭐ 이 부분이 중요: /profile/{userId} ⭐
    public ResponseEntity<MyPageEditDTO> updateUserProfile(
            @PathVariable("userId") String userId,
            @RequestPart("userNickname") String userNickname,
            @RequestPart("userName") String userName,
            @RequestPart("userEmail") String userEmail,
            @RequestPart("userPhone") String userPhone,
            @RequestPart("userFavoriteTeam") String userFavoriteTeam,
            @RequestPart(value = "userImagePath", required = false) String userImagePath, // 기존 경로 유지용
            @RequestPart(value = "userImageName", required = false) String userImageName, // 기존 이름 유지용
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage
    ) {
        try {
            // MyPageEditDTO 객체 생성 및 데이터 설정
            MyPageEditDTO myPageEditDTO = new MyPageEditDTO();
            myPageEditDTO.setUserId(userId); // URL 경로의 userId를 DTO에 설정
            myPageEditDTO.setUserNickname(userNickname);
            myPageEditDTO.setUserName(userName);
            myPageEditDTO.setUserEmail(userEmail);
            myPageEditDTO.setUserPhone(userPhone);
            myPageEditDTO.setUserFavoriteTeam(userFavoriteTeam);

            // 파일이 없는 경우, 기존 경로/이름을 DTO에 설정하여 서비스에서 유지할 수 있도록 함
            myPageEditDTO.setUserImagePath(userImagePath);
            myPageEditDTO.setUserImageName(userImageName);

            // 서비스 계층으로 업데이트 요청 전달
            MyPageEditDTO updatedUser = myPageEditService.updateUserProfile(userId, myPageEditDTO, profileImage);

            // 업데이트된 사용자 정보를 200 OK와 함께 반환
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            System.err.println("Update profile failed (User not found or invalid argument): " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404 Not Found (사용자 없음)
        } catch (Exception e) {
            System.err.println("Error updating user profile for ID " + userId + ": " + e.getMessage());
            e.printStackTrace(); // 상세 스택 트레이스 출력
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
        }
    }

    /**
     * 특정 사용자의 프로필 이미지를 삭제합니다.
     * DELETE /api/mypage/{userId}/profile/image
     * @param userId 프로필 이미지를 삭제할 사용자의 ID
     * @return 204 No Content (성공), 404 Not Found (사용자 없음), 500 Internal Server Error (서버 오류)
     */
    @DeleteMapping("/{userId}/profile/image")
    public ResponseEntity<Void> deleteUserProfileImage(@PathVariable("userId") String userId) {
        try {
            boolean deleted = myPageEditService.deleteProfileImage(userId);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 성공적으로 삭제(NULL로 업데이트)되었을 경우 204 No Content 반환
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 사용자 ID를 찾을 수 없거나 이미지가 없는 경우 404 Not Found 반환
            }
        } catch (Exception e) {
            System.err.println("Error deleting user profile image for ID " + userId + ": " + e.getMessage());
            e.printStackTrace(); // 상세 스택 트레이스 출력
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR); // 서버 내부 오류 발생 시 500 Internal Server Error 반환
        }
    }
}
