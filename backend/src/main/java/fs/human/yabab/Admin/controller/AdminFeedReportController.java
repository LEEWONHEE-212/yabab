// src/main/java/fs/human/yabab/Admin/controller/AdminFeedReportController.java
package fs.human.yabab.Admin.controller; // 패키지 경로 변경

import fs.human.yabab.Admin.service.AdminFeedReportService; // Service 임포트 경로 변경
import fs.human.yabab.Admin.vo.AdminFeedReportDTO; // DTO 임포트 경로 변경
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/feed-reports")
@CrossOrigin(origins = "http://192.168.0.47:3000", allowCredentials = "true")
public class AdminFeedReportController { // 컨트롤러 이름도 AdminFeedReportController로 변경

    private final AdminFeedReportService adminFeedReportService; // Service 타입 및 필드명 변경

    @Autowired
    public AdminFeedReportController(AdminFeedReportService adminFeedReportService) { // 생성자 파라미터 변경
        this.adminFeedReportService = adminFeedReportService;
    }

    /**
     * 게시물 신고 목록을 조회하는 API.
     * GET /api/admin/feed-reports
     * @param feedTitle 게시물 제목 검색어
     * @param feedContent 게시물 내용 검색어
     * @param reporterEmail 신고자 이메일 검색어
     * @param reportedUserEmail 대상 회원 이메일 검색어
     * @param status 신고 처리 상태 ('PENDING', 'ACCEPTED', 'REJECTED')
     * @return 신고 목록
     */
    @GetMapping
    public ResponseEntity<List<AdminFeedReportDTO>> getFeedReports(
            @RequestParam(required = false) String feedTitle,
            @RequestParam(required = false) String feedContent,
            @RequestParam(required = false) String reporterEmail,
            @RequestParam(required = false) String reportedUserEmail,
            @RequestParam(required = false) String status) { // status 타입 String으로 변경
        try {
            List<AdminFeedReportDTO> reports = adminFeedReportService.getFeedReports( // Service 메서드 호출
                    feedTitle, feedContent, reporterEmail, reportedUserEmail, status);
            if (reports.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching feed reports: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 게시물 신고 상태를 업데이트하는 API.
     * PUT /api/admin/feed-reports/{feedReportId}/status
     * @param feedReportId 처리할 신고 ID
     * @param payload 요청 본문 (newStatus, actionTaken, memo)
     * @param authorizationHeader (관리자 인증 토큰)
     * @return 처리 결과 메시지
     */
    @PutMapping("/{feedReportId}/status")
    public ResponseEntity<String> updateFeedReportStatus(
            @PathVariable("feedReportId") Long feedReportId,
            @RequestBody Map<String, String> payload,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        try {
            String newStatus = payload.get("status"); // 'ACCEPTED' or 'REJECTED'
            String actionTaken = payload.get("actionTaken");
            String memo = payload.get("memo");

            String processedBy = "admin"; // TODO: 실제 관리자 ID를 인증 토큰에서 추출하는 로직 구현 필요

            if (newStatus == null || (!newStatus.equals("ACCEPTED") && !newStatus.equals("REJECTED") && !newStatus.equals("PENDING"))) {
                return new ResponseEntity<>("유효하지 않은 신고 상태입니다.", HttpStatus.BAD_REQUEST);
            }

            boolean success = adminFeedReportService.processFeedReport(feedReportId, newStatus, processedBy, actionTaken, memo); // Service 메서드 호출

            if (success) {
                return new ResponseEntity<>("게시물 신고가 성공적으로 처리되었습니다.", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("게시물 신고 처리 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error processing feed report: " + e.getMessage());
            return new ResponseEntity<>("게시물 신고 처리 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
