package fs.human.yabab.RestaurantReview.controller;

import fs.human.yabab.RestaurantReview.service.MenuLikeService;
import fs.human.yabab.RestaurantReview.vo.MenuLikeRequestDTO;
import fs.human.yabab.RestaurantReview.vo.MenuLikeStatusDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/menus")
@CrossOrigin(origins = "http://localhost:3000")
public class MenuLikeController {
    private final MenuLikeService menuLikeService;

    @Autowired
    public MenuLikeController(MenuLikeService menuLikeService){
        this.menuLikeService = menuLikeService;
    }
    /**
     * 특정 메뉴에 대한 좋아요 상태를 토글합니다 (좋아요 추가 또는 취소).
     *
     * @param menuId    경로 변수에서 가져오는 메뉴 ID
     * @param requestDto 요청 본문에서 가져오는 좋아요 요청 DTO (userId 포함)
     * @return 변경된 좋아요 상태 및 총 좋아요 수를 포함하는 응답
     */
    @PostMapping("/{menuId}/like") // 예: POST /api/menus/123/like
    public ResponseEntity<MenuLikeStatusDTO> toggleMenuLike(
            @PathVariable("menuId") Long menuId,
            @RequestBody MenuLikeRequestDTO requestDto) {
        try {
            // requestDto의 menuId와 PathVariable의 menuId가 일치하는지 확인 (선택 사항)
            if (!menuId.equals(requestDto.getMenuId())) {
                throw new IllegalArgumentException("요청 본문의 메뉴 ID와 경로의 메뉴 ID가 일치하지 않습니다.");
            }

            // 서비스 계층의 좋아요 토글 로직 호출
            MenuLikeStatusDTO status = menuLikeService.toggleMenuLike(menuId, requestDto.getUserId());
            return new ResponseEntity<>(status, HttpStatus.OK); // 성공 시 200 OK 반환
        } catch (IllegalArgumentException e) {
            // 유효하지 않은 입력 값에 대한 예외 처리
            System.err.println("메뉴 좋아요 토글 요청 오류: " + e.getMessage());
            // 클라이언트에게 400 Bad Request와 함께 오류 메시지 반환
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            // 기타 예상치 못한 서버 오류 처리
            System.err.println("메뉴 좋아요 토글 중 서버 오류 발생: " + e.getMessage());
            // 클라이언트에게 500 Internal Server Error 반환
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 메뉴의 현재 좋아요 상태 (총 좋아요 수 및 사용자의 좋아요 여부)를 조회합니다.
     *
     * @param menuId   경로 변수에서 가져오는 메뉴 ID
     * @param userId   쿼리 파라미터로 선택적 사용자 ID (로그인하지 않은 경우 null 가능)
     * @return 메뉴의 좋아요 상태를 포함하는 응답
     */
    @GetMapping("/{menuId}/like/status") // 예: GET /api/menus/123/like/status?userId=user123
    public ResponseEntity<MenuLikeStatusDTO> getMenuLikeStatus(
            @PathVariable("menuId") Long menuId,
            @RequestParam(value = "userId", required = false) String userId) { // userId는 선택 사항
        try {
            // 서비스 계층의 좋아요 상태 조회 로직 호출
            MenuLikeStatusDTO status = menuLikeService.getMenuLikeStatus(menuId, userId);
            return new ResponseEntity<>(status, HttpStatus.OK); // 성공 시 200 OK 반환
        } catch (IllegalArgumentException e) {
            // 유효하지 않은 입력 값에 대한 예외 처리
            System.err.println("메뉴 좋아요 상태 조회 요청 오류: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            // 기타 예상치 못한 서버 오류 처리
            System.err.println("메뉴 좋아요 상태 조회 중 서버 오류 발생: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}