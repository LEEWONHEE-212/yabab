// src/main/java/fs/human/yabab/Admin/controller/AdminReviewReportController.java
package fs.human.yabab.Admin.controller;

import fs.human.yabab.Admin.service.AdminReviewReportService; // 변경된 서비스 임포트
import fs.human.yabab.Admin.vo.AdminReviewReportDTO; // 변경된 DTO 임포트
import fs.human.yabab.Admin.vo.AdminReviewReportSearchRequestDTO; // 변경된 검색 DTO 임포트
import fs.human.yabab.Admin.vo.AdminProcessRequestDTO; // 기존 ReportProcessRequestDTO 임포트
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports") // 기본 요청 경로
@CrossOrigin(origins = "http://localhost:3000") // 프론트엔드 URL에 맞게 설정 (CORS 허용)
public class AdminReviewReportController {

    private final AdminReviewReportService adminReviewReportService;

    @Autowired
    public AdminReviewReportController(AdminReviewReportService adminReviewReportService) {
        this.adminReviewReportService = adminReviewReportService;
    }

    /**
     * GET /api/admin/reports/reviews
     * 리뷰 신고 목록 조회 (페이징, 검색, 필터링 포함)
     * Request Parameters: page, size, searchType, searchTerm, status
     * @param searchRequest 검색 및 페이징 파라미터 DTO
     * @return 리뷰 신고 목록과 총 개수를 포함하는 ResponseEntity
     */
    @GetMapping("/reviews")
    public ResponseEntity<Map<String, Object>> getReviewReports(
            @ModelAttribute AdminReviewReportSearchRequestDTO searchRequest) {
        // @ModelAttribute는 쿼리 파라미터(예: ?page=0&size=10&searchType=...)를 객체에 자동으로 매핑합니다.
        Map<String, Object> reports = adminReviewReportService.getReviewReports(searchRequest);
        return ResponseEntity.ok(reports);
    }

    /**
     * GET /api/admin/reports/reviews/{reportId}
     * 특정 리뷰 신고 상세 정보 조회
     * @param reportId 경로 변수로 전달되는 신고 ID
     * @return AdminReviewReportDTO 객체 또는 404 Not Found
     */
    @GetMapping("/reviews/{reportId}")
    public ResponseEntity<AdminReviewReportDTO> getReviewReportDetail(@PathVariable Long reportId) {
        AdminReviewReportDTO detailedReport = adminReviewReportService.getReviewReportById(reportId);
        if (detailedReport == null) {
            // 해당 ID의 신고를 찾을 수 없을 경우 404 응답
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(detailedReport);
    }

    /**
     * PATCH /api/admin/reports/reviews/{reportId}/process
     * 리뷰 신고 처리 (수락 또는 거절)
     * @param reportId 처리할 신고 ID
     * @param request 처리 액션 ("ACCEPT" 또는 "REJECT"), 처리 관리자 ID, 메모 등
     * @return 성공 시 200 OK, 유효하지 않은 요청 시 400 Bad Request, 서버 오류 시 500 Internal Server Error
     */
    @PatchMapping("/reviews/{reportId}/process")
    public ResponseEntity<Void> processReviewReport(@PathVariable Long reportId,
                                                    @RequestBody AdminProcessRequestDTO request) {
        // @RequestBody는 HTTP 요청 본문의 JSON 데이터를 객체에 매핑합니다.
        try {
            adminReviewReportService.processReviewReport(reportId, request);
            return ResponseEntity.ok().build(); // 처리 성공 시 200 OK 응답
        } catch (IllegalArgumentException e) {
            // 유효하지 않은 요청 (예: 잘못된 액션, 없는 신고 ID)
            System.err.println("Bad Request: " + e.getMessage()); // 로깅
            return ResponseEntity.badRequest().build(); // 400 Bad Request 응답
        } catch (Exception e) {
            // 기타 예상치 못한 서버 오류 (DB 연결 문제, 런타임 예외 등)
            System.err.println("Internal Server Error processing report: " + e.getMessage()); // 로깅
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error 응답
        }
    }
}