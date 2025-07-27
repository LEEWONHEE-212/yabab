package fs.human.yabab.MyPage.controller; // MyPage 패키지 안에 Controller를 두는 것으로 가정

import fs.human.yabab.MyPage.service.MyPageAnnotaionService; // MyPageAnnotaionService import
import fs.human.yabab.MyPage.vo.MyPageAnnotaion; // MyPageAnnotaion DTO import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mypage") // Assuming this is part of mypage functionality
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") // CORS 설정 추가
public class MyPageAnnotaionController{ // Controller 이름은 기존 MyPageFeedController 유지

    private final MyPageAnnotaionService myPageAnnotaionService; // Service 타입 및 필드명 변경

    @Autowired // Constructor Injection
    public MyPageAnnotaionController(MyPageAnnotaionService myPageAnnotaionService) { // 생성자 파라미터 변경
        this.myPageAnnotaionService = myPageAnnotaionService;
    }

    /**
     * 특정 사용자가 작성한 모든 게시글을 조회하는 엔드포인트.
     * GET /api/mypage/{userId}/posts
     * @param userId 게시글을 조회할 사용자의 ID
     * @return 해당 사용자의 게시글 목록 (MyPageAnnotaion DTO 리스트)
     */
    @GetMapping("/{userId}/posts")
    public ResponseEntity<List<MyPageAnnotaion>> getUserPosts(@PathVariable("userId") String userId) {
        List<MyPageAnnotaion> userPosts = myPageAnnotaionService.getUserPosts(userId); // Service 메서드 호출
        if (userPosts.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        }
        return new ResponseEntity<>(userPosts, HttpStatus.OK); // 200 OK
    }

    /**
     * 특정 게시글을 소프트 삭제하는 엔드포인트.
     * DELETE /api/mypage/{userId}/posts/{feedId}
     * @param userId 삭제를 요청한 사용자의 ID (권한 확인 및 updatedBy 필드에 사용)
     * @param feedId 삭제할 게시글의 ID
     * @return 삭제 결과 메시지
     */
    @DeleteMapping("/{userId}/posts/{feedId}")
    public ResponseEntity<String> deleteUserPost(
            @PathVariable("userId") String userId,
            @PathVariable("feedId") Long feedId) {
        try {
            boolean deleted = myPageAnnotaionService.deleteUserPost(feedId, userId); // Service 메서드 호출
            if (deleted) {
                return new ResponseEntity<>("게시글이 성공적으로 삭제되었습니다.", HttpStatus.OK); // 200 OK
            } else {
                // This could mean the feedId didn't exist, was already deleted, or didn't belong to the user
                return new ResponseEntity<>("게시글 삭제에 실패했거나, 해당 게시글이 존재하지 않습니다.", HttpStatus.NOT_FOUND); // 404 Not Found
            }
        } catch (Exception e) {
            System.err.println("Error deleting post: " + e.getMessage());
            return new ResponseEntity<>("게시글 삭제 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
        }
    }
}
