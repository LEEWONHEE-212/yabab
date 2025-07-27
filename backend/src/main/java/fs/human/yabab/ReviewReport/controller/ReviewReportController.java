package fs.human.yabab.ReviewReport.controller;

import fs.human.yabab.ReviewReport.service.ReviewReportService;
import fs.human.yabab.ReviewReport.vo.ReviewReportDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger; // Logger 임포트
import org.slf4j.LoggerFactory; // LoggerFactory 임포트

import java.util.List;

@RestController
@RequestMapping("/api/Reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewReportController {

    private static final Logger logger = LoggerFactory.getLogger(ReviewReportController.class); // 로거 인스턴스 생성

    private final ReviewReportService reviewReportService;

    @Autowired
    public ReviewReportController(ReviewReportService reviewReportService) {
        this.reviewReportService = reviewReportService;
    }

    /**
     * 새로운 리뷰 신고를 접수합니다.
     * 프론트엔드에서 POST /api/Reviews/{reviewId}/report 로 요청합니다.
     * 요청 본문은 ReviewReportDTO 형식입니다.
     */
    @PostMapping("/{reviewId}/report")
    public ResponseEntity<ReviewReportDTO> createReviewReport(@PathVariable Long reviewId,
                                                              @RequestBody ReviewReportDTO reportDTO) {
        // ⭐⭐ 여기에 로그를 추가하여 DTO의 필드 값들을 확인합니다. ⭐⭐
        logger.info("--- ReviewReportController.createReviewReport 호출 ---");
        logger.info("Path Variable reviewId: {}", reviewId);
        logger.info("Received reportDTO.getReviewId(): {}", reportDTO.getReviewId());
        logger.info("Received reportDTO.getReporterUserId(): {}", reportDTO.getReporterUserId()); // ⭐ 이 값이 NULL인지 확인
        logger.info("Received reportDTO.getReportedUserId(): {}", reportDTO.getReportedUserId());
        logger.info("Received reportDTO.getReportReason(): {}", reportDTO.getReportReason());
        logger.info("Received reportDTO.getReportDetails(): {}", reportDTO.getReportDetails());
        logger.info("--- 컨트롤러 로그 끝 ---");

        try {
            // DTO에 reviewId를 설정 (Path Variable에서 받은 값으로)
            reportDTO.setReviewId(reviewId);
            ReviewReportDTO createdReport = reviewReportService.createReviewReport(reportDTO);
            return new ResponseEntity<>(createdReport, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            logger.warn("리뷰 신고 요청 유효성 검사 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            logger.error("리뷰 신고 중 서버 오류 발생: {}", e.getMessage(), e); // 스택 트레이스 포함
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * 특정 신고 ID로 신고 정보를 조회합니다. (관리자용 또는 디버깅용)
     * GET /api/Reviews/reports/{reportId}
     */
    @GetMapping("/reports/{reportId}")
    public ResponseEntity<ReviewReportDTO> getReportById(@PathVariable Long reportId) {
        ReviewReportDTO report = reviewReportService.getReportById(reportId);
        if (report == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(report, HttpStatus.OK);
    }

    /**
     * 특정 리뷰 ID에 해당하는 모든 신고 목록을 조회합니다. (관리자용)
     * GET /api/Reviews/{reviewId}/reports
     */
    @GetMapping("/{reviewId}/reports")
    public ResponseEntity<List<ReviewReportDTO>> getReportsByReviewId(@PathVariable Long reviewId) {
        List<ReviewReportDTO> reports = reviewReportService.getReportsByReviewId(reviewId);
        return new ResponseEntity<>(reports, HttpStatus.OK);
    }

    /**
     * 신고 상태를 업데이트합니다. (관리자용)
     * PUT /api/Reviews/reports/{reportId}/status
     */
    @PutMapping("/reports/{reportId}/status")
    public ResponseEntity<Void> updateReportStatus(@PathVariable Long reportId,
                                                   @RequestBody ReviewReportDTO reportDTO) {
        boolean success = reviewReportService.updateReportStatus(reportId, reportDTO.getStatus(), reportDTO.getUpdatedBy());
        if (success) {
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    /**
     * 신고 처리 세부 정보를 업데이트합니다. (관리자용)
     * PUT /api/Reviews/reports/{reportId}/details
     */
    @PutMapping("/reports/{reportId}/details")
    public ResponseEntity<Void> updateReportProcessedDetails(@PathVariable Long reportId,
                                                             @RequestBody ReviewReportDTO reportDTO) {
        boolean success = reviewReportService.updateReportProcessedDetails(reportId, reportDTO);
        if (success) {
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
