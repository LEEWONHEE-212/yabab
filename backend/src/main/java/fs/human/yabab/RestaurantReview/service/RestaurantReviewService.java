package fs.human.yabab.RestaurantReview.service;

import fs.human.yabab.RestaurantReview.dao.RestaurantReviewDAO;
import fs.human.yabab.RestaurantReview.vo.RestaurantReviewDTO;
import fs.human.yabab.RestaurantReview.vo.ReviewDetailDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class RestaurantReviewService {
    private static final Logger logger = LoggerFactory.getLogger(RestaurantReviewService.class);

    private final RestaurantReviewDAO restaurantReviewDAO;

    // application.properties에서 실제 이미지 저장 경로를 주입받습니다.
    // 이 서비스 내에서 직접 파일 저장 로직을 처리하기 때문에 필요합니다.
    @Value("${upload.uploads.image.dir}")
    private String uploadDir;

    @Autowired
    public RestaurantReviewService(RestaurantReviewDAO restaurantReviewDAO) {
        this.restaurantReviewDAO = restaurantReviewDAO;
        logger.info("RestaurantReviewService 초기화됨.");
    }

    /**
     * 특정 식당 ID로 식당 정보를 조회합니다.
     * 해당 식당의 메뉴 목록, 리뷰 목록, 그리고 평균 별점 및 총 리뷰 개수도 함께 로드됩니다.
     * AVERAGE_RATING과 REVIEW_COUNT는 조회 시마다 실시간으로 계산됩니다.
     * @param restaurantId 조회할 식당의 ID
     * @return 특정 식당 정보 (없으면 null)
     */
    public RestaurantReviewDTO getRestaurantDetails(Long restaurantId) {
        logger.info("getRestaurantDetails 메서드 호출됨. restaurantId: {}", restaurantId);
        RestaurantReviewDTO restaurant = restaurantReviewDAO.getRestaurantDetailsWithMenusAndReviews(restaurantId);
        if (restaurant == null) {
            logger.warn("restaurantId {} 에 해당하는 식당을 찾을 수 없습니다.", restaurantId);
        } else {
            logger.info("restaurantId {} 에 해당하는 식당 정보 조회 성공.", restaurantId);
        }
        return restaurant;
    }

    /**
     * 식당에 새로운 리뷰를 추가합니다.
     * 이 작업은 하나의 트랜잭션으로 묶여 원자성을 보장합니다.
     * 이미지 파일이 있다면 해당 경로에 저장하고, 저장된 경로를 DB에 함께 기록합니다.
     *
     * @param restaurantId 리뷰를 작성할 식당의 ID
     * @param reviewDetailDTO 추가할 리뷰 정보가 포함된 ReviewDetailDTO 객체 (userId, reviewRating, reviewContent 등)
     * @param imageFile 클라이언트로부터 업로드된 실제 이미지 파일 (MultipartFile)
     * @return 성공적으로 추가된 ReviewDetailDTO 객체 (DB에서 할당된 reviewId 포함)
     * @throws IllegalArgumentException 식당 ID, 사용자 ID, 별점 정보가 누락되거나 유효하지 않은 경우 발생
     * @throws RuntimeException 이미지 파일 저장 또는 리뷰 DB 삽입 중 오류 발생 시
     */
    @Transactional
    public ReviewDetailDTO addReview(Long restaurantId, ReviewDetailDTO reviewDetailDTO, MultipartFile imageFile) {
        logger.info("addReview 메서드 호출됨. restaurantId: {}", restaurantId);
        logger.debug("수신된 ReviewDetailDTO: {}", reviewDetailDTO);
        logger.debug("수신된 imageFile: {}", imageFile != null ? imageFile.getOriginalFilename() : "없음");

        // 1. 필수 값 검증
        logger.debug("리뷰 데이터 필수 값 검증 시작.");
        if (restaurantId == null) {
            logger.error("IllegalArgumentException: 리뷰를 추가할 식당 ID가 null입니다.");
            throw new IllegalArgumentException("리뷰를 추가할 식당 ID가 필요합니다.");
        }
        if (reviewDetailDTO.getUserId() == null || reviewDetailDTO.getUserId().trim().isEmpty()) {
            logger.error("IllegalArgumentException: 리뷰 작성자 ID가 null이거나 비어있습니다. userId: '{}'", reviewDetailDTO.getUserId());
            throw new IllegalArgumentException("리뷰 작성자 ID가 필요합니다.");
        }
        if (reviewDetailDTO.getReviewRating() == null || reviewDetailDTO.getReviewRating() < 1 || reviewDetailDTO.getReviewRating() > 5) {
            logger.error("IllegalArgumentException: 리뷰 별점이 유효하지 않습니다. reviewRating: {}", reviewDetailDTO.getReviewRating());
            throw new IllegalArgumentException("리뷰 별점은 1점부터 5점 사이여야 합니다.");
        }
        if (reviewDetailDTO.getReviewContent() == null || reviewDetailDTO.getReviewContent().trim().isEmpty()) {
            logger.error("IllegalArgumentException: 리뷰 내용이 null이거나 비어있습니다. reviewContent: '{}'", reviewDetailDTO.getReviewContent());
            throw new IllegalArgumentException("리뷰 내용이 필요합니다.");
        }
        logger.debug("리뷰 데이터 필수 값 검증 완료.");

        // 2. 이미지 파일 처리 (Service 내에서 직접 처리)
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                logger.info("리뷰 이미지 파일 감지됨: {}", imageFile.getOriginalFilename());

                // 2.1. 업로드 디렉토리 존재 여부 확인 및 생성
                Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                    logger.info("업로드 디렉토리 생성: {}", uploadPath);
                }

                // 2.2. 고유한 파일 이름 생성
                String originalFilename = imageFile.getOriginalFilename();
                String fileExtension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String uniqueFilename = UUID.randomUUID().toString() + fileExtension; // UUID_확장자

                // 2.3. 파일 저장 경로 설정
                Path targetLocation = uploadPath.resolve(uniqueFilename);

                // 2.4. 파일 저장
                Files.copy(imageFile.getInputStream(), targetLocation); // 파일 스트림을 복사하여 저장
                logger.info("이미지 파일 저장 성공: 원본 파일명 '{}' -> 저장된 파일명 '{}'", originalFilename, uniqueFilename);

                // 2.5. ReviewDetailDTO에 저장된 웹 접근 경로 설정 (WebConfig의 /restaurant-images/** 매핑과 일치해야 함)
                String webAccessiblePath = "/uploads/" + uniqueFilename;
                reviewDetailDTO.setReviewImagePath(webAccessiblePath);
                reviewDetailDTO.setReviewImageName(originalFilename); // 원본 파일명 DTO에 설정
            } catch (IOException e) {
                logger.error("이미지 파일 저장 중 오류 발생: {}", e.getMessage(), e);
                // 파일 저장 실패 시 런타임 예외 발생시켜 트랜잭션 롤백 유도
                throw new RuntimeException("이미지 파일 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
            } catch (IllegalArgumentException e) {
                logger.error("이미지 파일 처리 중 유효성 오류: {}", e.getMessage());
                throw new IllegalArgumentException(e.getMessage());
            }
        } else {
            logger.info("업로드할 리뷰 이미지가 없습니다. reviewImagePath와 reviewImageName을 null로 설정합니다.");
            reviewDetailDTO.setReviewImagePath(null); // 이미지가 없으므로 null로 명시적 설정
            reviewDetailDTO.setReviewImageName(null);
        }

        // 이미지 경로 및 이름 값 로깅 (파일 처리 후 최종 값 확인)
        logger.debug("처리 후 Review Image Path: '{}'", reviewDetailDTO.getReviewImagePath());
        logger.debug("처리 후 Review Image Name: '{}'", reviewDetailDTO.getReviewImageName());

        try {
            // 3. 리뷰를 DB에 삽입 (이미지 경로 정보가 DTO에 포함된 상태)
            logger.info("restaurantReviewDAO.insertReview 호출 시도. restaurantId: {}, DTO: {}", restaurantId, reviewDetailDTO);
            restaurantReviewDAO.insertReview(restaurantId, reviewDetailDTO);
            logger.info("리뷰가 성공적으로 DB에 삽입되었습니다. 할당된 reviewId: {}", reviewDetailDTO.getReviewId());
        } catch (Exception e) {
            logger.error("리뷰 DB 삽입 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("리뷰 DB 삽입 중 오류가 발생했습니다: " + e.getMessage(), e);
        }

        // 4. 반환
        logger.info("addReview 메서드 종료. 반환되는 ReviewDetailDTO: {}", reviewDetailDTO);
        return reviewDetailDTO;
    }
}