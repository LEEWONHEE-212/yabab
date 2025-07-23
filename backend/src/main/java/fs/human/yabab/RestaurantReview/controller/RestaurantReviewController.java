package fs.human.yabab.RestaurantReview.controller;

import fs.human.yabab.RestaurantReview.service.RestaurantReviewService;
import fs.human.yabab.RestaurantReview.vo.RestaurantReviewDTO;
import fs.human.yabab.RestaurantReview.vo.ReviewDetailDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController // RESTful 웹 서비스 컨트롤러임을 나타냅니다.
@RequestMapping("/api/Reviews") // 기존대로 /api/Reviews로 유지
@CrossOrigin(origins = "http://localhost:3000")
public class RestaurantReviewController {
    private static final Logger logger = LoggerFactory.getLogger(RestaurantReviewController.class); // ✨ 로거 인스턴스 생성

    private final RestaurantReviewService restaurantReviewService;

    @Autowired
    public RestaurantReviewController(RestaurantReviewService restaurantReviewService) {
        this.restaurantReviewService = restaurantReviewService;
        logger.info("RestaurantReviewController 초기화됨."); // ✨ 컨트롤러 초기화 로그
    }

    /**
     * 특정 식당의 상세 정보 (메뉴, 리뷰, 평균 별점, 리뷰 개수 포함)를 조회합니다.
     * GET /api/Reviews/{restaurantId}
     *
     * @param restaurantId 조회할 식당의 고유 ID
     * @return 식당 상세 정보와 함께 HTTP 200 OK 또는 404 Not Found 응답
     */
    @GetMapping("/{restaurantId}")
    public ResponseEntity<RestaurantReviewDTO> getRestaurantDetails(@PathVariable Long restaurantId) {
        logger.info("GET /api/Reviews/{} 호출: 식당 상세 정보 조회", restaurantId); // ✨ 로그 추가
        RestaurantReviewDTO restaurant = restaurantReviewService.getRestaurantDetails(restaurantId);
        if (restaurant == null) {
            logger.warn("식당 ID {} 에 해당하는 식당을 찾을 수 없습니다. 404 응답.", restaurantId); // ✨ 로그 추가
            // 식당을 찾을 수 없는 경우 404 Not Found 응답
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        logger.info("식당 ID {} 상세 정보 조회 성공. 200 응답.", restaurantId); // ✨ 로그 추가
        // 식당을 찾은 경우 200 OK 응답과 함께 데이터 반환
        return new ResponseEntity<>(restaurant, HttpStatus.OK);
    }

    /**
     * 특정 식당에 새로운 리뷰를 추가합니다.
     * 리뷰 작성 후 식당의 평균 별점과 리뷰 개수가 업데이트됩니다.
     * POST /api/Reviews/{restaurantId}/reviews
     *
     * @param restaurantId 리뷰를 작성할 식당의 고유 ID (URL 경로 변수)
     * @param reviewDetailDTO 클라이언트로부터 받은 리뷰 데이터 (JSON 형태의 ReviewDetailDTO)
     * @param imageFile 클라이언트로부터 업로드된 실제 이미지 파일 (선택 사항)
     * @return 생성된 리뷰 정보와 함께 HTTP 201 Created 또는 에러 응답
     */
    @PostMapping(value = "/{restaurantId}/reviews", consumes = {"multipart/form-data"}) // ✨ 파일 업로드 지원을 위한 consumes 설정
    public ResponseEntity<?> addReview(
            @PathVariable Long restaurantId,
            @RequestPart("reviewData") ReviewDetailDTO reviewDetailDTO, // ✨ JSON 데이터를 위한 @RequestPart 사용
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) { // ✨ 이미지 파일을 위한 @RequestPart 사용 (필수 아님)

        logger.info("POST /api/Reviews/{}/reviews 호출: 새로운 리뷰 추가 요청", restaurantId); // ✨ 로그 추가
        logger.debug("수신된 reviewData: {}", reviewDetailDTO); // ✨ 디버그 로그
        logger.debug("수신된 imageFile: {}", imageFile != null ? imageFile.getOriginalFilename() : "없음"); // ✨ 디버그 로그

        try {
            // Service 계층의 addReview 메서드 호출 시 MultipartFile도 함께 전달
            ReviewDetailDTO createdReview = restaurantReviewService.addReview(restaurantId, reviewDetailDTO, imageFile);

            logger.info("리뷰 추가 성공. reviewId: {}. 201 응답.", createdReview.getReviewId()); // ✨ 로그 추가
            // 성공적으로 리뷰가 생성되면 201 Created 응답과 함께 생성된 리뷰 정보 반환
            return new ResponseEntity<>(createdReview, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            logger.warn("리뷰 추가 요청 유효성 검사 실패: {}", e.getMessage()); // ✨ 로그 추가
            // 필수 값 누락 등 클라이언트 요청 오류 (BAD_REQUEST)
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            logger.error("리뷰 추가 중 서버 오류 발생: {}", e.getMessage(), e); // ✨ 에러 로그 (스택 트레이스 포함)
            // 파일 저장 실패, DB 삽입 실패 등 서버 측 오류 (INTERNAL_SERVER_ERROR)
            return new ResponseEntity<>("리뷰 추가 중 오류가 발생했습니다: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 다른 API End-point (예: 리뷰 수정, 삭제)가 필요하다면 여기에 추가합니다.
}