// src/main/java/fs/human/yabab/Admin/controller/AdminUserController.java

package fs.human.yabab.Admin.controller;

import fs.human.yabab.Admin.service.AdminUserService;
import fs.human.yabab.Admin.vo.AdminPageResponseDTO;
import fs.human.yabab.Admin.vo.AdminUserDTO;
import fs.human.yabab.Admin.vo.AdminUserSearchRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping; // DeleteMapping 임포트 추가
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PutMapping; // PutMapping은 더 이상 사용하지 않음
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<AdminPageResponseDTO<AdminUserDTO>> getAdminUserList(
            @ModelAttribute AdminUserSearchRequestDTO searchRequest) {
        log.info("회원 목록 조회 요청 받음: {}", searchRequest);

        if (searchRequest.getPage() < 0) {
            searchRequest.setPage(0);
        }
        if (searchRequest.getSize() <= 0 || searchRequest.getSize() > 100) {
            searchRequest.setSize(10);
        }

        try {
            AdminPageResponseDTO<AdminUserDTO> response = adminUserService.getPagedUsers(searchRequest);
            log.info("회원 목록 조회 성공. 총 {}개 항목, {} 페이지 (현재 페이지: {})",
                    response.getTotalElements(), response.getTotalPages(), response.getPageNumber());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("회원 목록 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AdminUserDTO> getAdminUserDetail(@PathVariable("userId") String userId) {
        log.info("회원 상세 정보 조회 요청 받음. userId: {}", userId);
        try {
            AdminUserDTO user = adminUserService.getUserById(userId);
            if (user != null) {
                log.info("회원 상세 정보 조회 성공: {}", user.getUserId());
                return ResponseEntity.ok(user);
            } else {
                log.warn("ID {}에 해당하는 회원을 찾을 수 없음.", userId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("회원 상세 정보 조회 중 오류 발생. userId: {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 특정 회원을 데이터베이스에서 물리적으로 삭제하는 API 엔드포인트.
     * DELETE 요청: /api/admin/users/{userId}
     *
     * @param userId 삭제할 회원의 ID (경로 변수)
     * @return 처리 결과에 따른 상태 코드
     */
    @DeleteMapping("/{userId}") // PUT -> DELETE로 변경, 경로도 /deactivate 제거
    public ResponseEntity<Void> deleteAdminUser(@PathVariable("userId") String userId) { // 메서드 이름 변경
        log.info("회원 삭제 요청 받음. userId: {}", userId);
        try {
            boolean isDeleted = adminUserService.deleteUser(userId); // Service 메서드 호출 변경
            if (isDeleted) {
                log.info("회원 ID {} 삭제 성공.", userId);
                return ResponseEntity.noContent().build(); // HTTP 204 No Content (삭제 성공 시 일반적)
            } else {
                log.warn("회원 ID {} 삭제 실패 (대상이 없거나 이미 삭제됨).", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            log.error("회원 삭제 중 오류 발생. userId: {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}