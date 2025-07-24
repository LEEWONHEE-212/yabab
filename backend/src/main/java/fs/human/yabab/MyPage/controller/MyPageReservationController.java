package fs.human.yabab.MyPage.controller;

import fs.human.yabab.MyPage.service.MyPageReservationService;
import fs.human.yabab.MyPage.vo.MyPageReservationDTO;
import fs.human.yabab.MyPage.vo.MyPageReviewDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/mypage")
@CrossOrigin(origins = "http://localhost:3000")
public class MyPageReservationController {
    private final MyPageReservationService myPageReservationService;

    @Autowired
    public MyPageReservationController(MyPageReservationService myPageReservationService){
        this.myPageReservationService=myPageReservationService;
    }

    /**
     * 특정 사용자의 예약 내역 리스트를 조회하는 API
     * GET /api/mypage/{userId}/reservations
     *
     * @param userId 경로 변수로 전달받을 사용자 ID
     * @return 예약 내역 리스트 (MyPageReservationDTO) 또는 에러 응답
     */
    @GetMapping("/{userId}/reservations")
    public ResponseEntity<List<MyPageReservationDTO>> getUserReservations(@PathVariable("userId") String userId) {
        // 실제 애플리케이션에서는 JWT 토큰 등을 통해 인증된 사용자 ID를 사용하거나,
        // 세션에서 사용자 정보를 가져오는 것이 더 안전합니다.
        // 현재는 URL 경로에서 userId를 직접 받습니다.

        if (userId == null || userId.trim().isEmpty()) {
            // 사용자 ID가 유효하지 않을 경우 Bad Request 응답
            System.err.println("Error: userId is null or empty for reservations request.");
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.BAD_REQUEST);
        }

        try {
            List<MyPageReservationDTO> reservations = myPageReservationService.getUserReservations(userId);
            return new ResponseEntity<>(reservations, HttpStatus.OK);
        } catch (Exception e) {
            // 예외 발생 시 서버 에러 로그 기록 및 500 Internal Server Error 반환
            System.err.println("Failed to fetch reservations for user " + userId + ": " + e.getMessage());
            // 개발 단계에서는 상세 에러 메시지를 포함할 수 있으나, 프로덕션에서는 보안상 최소화하는 것이 좋습니다.
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 사용자의 작성 리뷰 리스트를 조회하는 API
     * GET /api/mypage/{userId}/reviews
     *
     * @param userId 경로 변수로 전달받을 사용자 ID
     * @return 작성 리뷰 리스트 (MyPageReviewDTO) 또는 에러 응답
     */
    @GetMapping("/{userId}/reviews")
    public ResponseEntity<List<MyPageReviewDTO>> getUserReviews(@PathVariable("userId") String userId) {
        // 실제 애플리케이션에서는 JWT 토큰 등을 통해 인증된 사용자 ID를 사용하거나,
        // 세션에서 사용자 정보를 가져오는 것이 더 안전합니다.

        if (userId == null || userId.trim().isEmpty()) {
            System.err.println("Error: userId is null or empty for reviews request.");
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.BAD_REQUEST);
        }

        try {
            List<MyPageReviewDTO> reviews = myPageReservationService.getUserReviews(userId);
            return new ResponseEntity<>(reviews, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Failed to fetch reviews for user " + userId + ": " + e.getMessage());
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
