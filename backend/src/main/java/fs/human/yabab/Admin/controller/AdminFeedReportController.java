// src/main/java/fs/human/yabab/Admin/controller/AdminFeedReportController.java
package fs.human.yabab.Admin.controller;

import fs.human.yabab.Admin.service.AdminFeedReportService;
import fs.human.yabab.Admin.vo.AdminFeedReportDTO;
import fs.human.yabab.Admin.vo.AdminFeedRequestDTO;
import fs.human.yabab.Admin.vo.AdminPageResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/feed-reports")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminFeedReportController {

    private final AdminFeedReportService adminFeedReportService;

    @Autowired
    public AdminFeedReportController(AdminFeedReportService adminFeedReportService) {
        this.adminFeedReportService = adminFeedReportService;
    }

    @GetMapping
    public ResponseEntity<AdminPageResponseDTO<AdminFeedReportDTO>> getFeedReports(
            @RequestParam(required = false) String feedTitle,
            @RequestParam(required = false) String feedContent,
            @RequestParam(required = false) String reporterEmail,
            @RequestParam(required = false) String reportedUserEmail,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "CREATED_DATE") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            AdminFeedRequestDTO requestDTO = new AdminFeedRequestDTO();
            requestDTO.setPage(page);
            requestDTO.setSize(size);
            requestDTO.setSortBy(sortBy);
            requestDTO.setSortDirection(sortDirection);

            AdminPageResponseDTO<AdminFeedReportDTO> reports = adminFeedReportService.getFeedReports(
                    feedTitle, feedContent, reporterEmail, reportedUserEmail, status, requestDTO);

            if (reports.getContent().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching feed reports: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{feedReportId}")
    public ResponseEntity<AdminFeedReportDTO> getFeedReportDetail(@PathVariable("feedReportId") Long feedReportId) {
        try {
            AdminFeedReportDTO report = adminFeedReportService.selectFeedReportById(feedReportId);
            if (report == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(report, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching feed report detail for ID " + feedReportId + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{feedReportId}/status")
    public ResponseEntity<String> updateFeedReportStatus(
            @PathVariable("feedReportId") Long feedReportId,
            @RequestBody Map<String, String> payload,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        try {
            String newStatus = payload.get("status");
            String actionTaken = payload.get("actionTaken");
            String memo = payload.get("memo");

            String processedBy = "admin"; // TODO: Implement actual admin ID extraction

            if (newStatus == null || (!newStatus.equals("ACCEPTED") && !newStatus.equals("REJECTED") && !newStatus.equals("PENDING"))) {
                return new ResponseEntity<>("유효하지 않은 신고 상태입니다.", HttpStatus.BAD_REQUEST);
            }

            boolean success = adminFeedReportService.processFeedReport(feedReportId, newStatus, processedBy, actionTaken, memo);

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
