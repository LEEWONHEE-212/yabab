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
@RequestMapping("/api/mypage")
@CrossOrigin(origins = "http://192.168.0.47:3000")
public class MyPageEditController {
    private final MyPageEditService myPageEditService;

    public MyPageEditController(MyPageEditService myPageEditService){
        this.myPageEditService=myPageEditService;
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
            // 로깅 처리 (실제 환경에서는 로거 사용)
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
        }
    }

    /**
     * 회원 정보 및 프로필 이미지를 업데이트하는 API
     * PUT /api/mypage/{userId}/profile
     *
     * @param userId 업데이트할 회원의 ID (경로 변수)
     * @param myPageEditDTO 업데이트할 회원 정보 (JSON 데이터, @RequestPart("data")로 바인딩)
     * @param profileImage 업로드할 프로필 이미지 파일 (선택 사항)
     * @return ResponseEntity<MyPageEditDTO> 업데이트된 회원 정보와 HTTP 상태
     */
    @PutMapping(value = "/{userId}/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MyPageEditDTO> updateUserProfile(
            @PathVariable String userId,
            @RequestPart("data") MyPageEditDTO myPageEditDTO, // JSON 데이터를 "data" 파트로 받습니다.
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage // 프로필 이미지 파일, 필수가 아님
    ) {
        // 주의: 실제 애플리케이션에서는 userId를 인증된 사용자의 Principal 객체에서 가져오는 것이 보안상 더 안전합니다.
        // 현재는 편의상 경로 변수에서 직접 받습니다.
        try {
            // 서비스 계층으로 업데이트 요청 전달
            MyPageEditDTO updatedUser = myPageEditService.updateUserProfile(userId, myPageEditDTO, profileImage);

            // 업데이트된 사용자 정보를 200 OK와 함께 반환
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            // 요청 본문 파싱 오류 등 클라이언트 오류일 경우 400 Bad Request
            if (e instanceof IllegalArgumentException) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
        }
    }
}
