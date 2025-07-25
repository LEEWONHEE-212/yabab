// src/main/java/fs/human/yabab/Admin/service/AdminReviewReportService.java
package fs.human.yabab.Admin.service;

import fs.human.yabab.Admin.dao.AdminReviewReportDAO;
import fs.human.yabab.Admin.vo.AdminReviewReportDTO;
import fs.human.yabab.Admin.vo.AdminReviewReportSearchRequestDTO;
import fs.human.yabab.Admin.vo.AdminProcessRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminReviewReportService {

    private final AdminReviewReportDAO adminReviewReportDAO;

    @Autowired
    public AdminReviewReportService(AdminReviewReportDAO adminReviewReportDAO) {
        this.adminReviewReportDAO = adminReviewReportDAO;
    }

    /**
     * 페이징, 검색, 필터링을 포함한 리뷰 신고 목록을 조회합니다.
     * @param searchRequest 검색 및 페이징 조건 DTO
     * @return 목록 및 총 개수를 포함하는 Map
     */
    public Map<String, Object> getReviewReports(AdminReviewReportSearchRequestDTO searchRequest) {
        // 총 개수 조회 (페이징을 위해 필요)
        int totalReports = adminReviewReportDAO.selectReviewReportsCount(searchRequest);

        // 실제 목록 조회
        List<AdminReviewReportDTO> reports = adminReviewReportDAO.selectReviewReports(searchRequest);

        Map<String, Object> result = new HashMap<>();
        result.put("content", reports); // 데이터 목록
        result.put("totalElements", totalReports); // 전체 데이터 개수
        // 프론트엔드에서 페이징을 위해 필요한 정보들을 추가합니다.
        result.put("totalPages", (int) Math.ceil((double) totalReports / searchRequest.getSize())); // totalPages 계산 및 추가
        result.put("pageNumber", searchRequest.getPage()); // currentPage 대신 pageNumber로 일관성 유지 (프론트엔드에서 사용하는 이름 확인)
        result.put("pageSize", searchRequest.getSize()); // pageSize 추가
        return result;
    }

    /**
     * 특정 리뷰 신고의 상세 정보를 조회합니다.
     * @param reportId 신고 ID
     * @return AdminReviewReportDTO 객체
     */
    public AdminReviewReportDTO getReviewReportById(Long reportId) {
        return adminReviewReportDAO.selectReviewReportById(reportId);
    }

    /**
     * 리뷰 신고를 처리합니다 (수락 또는 거절).
     * 신고 수락 시 해당 리뷰를 삭제하는 트랜잭션 로직을 포함합니다.
     * @param reportId 처리할 신고 ID
     * @param request 처리 요청 DTO (action, adminId, memo)
     */
    @Transactional
    public void processReviewReport(Long reportId, AdminProcessRequestDTO request) {
        String newStatus;
        String actionTaken = "NONE";

        if ("ACCEPT".equalsIgnoreCase(request.getAction())) {
            newStatus = "ACCEPTED";
            AdminReviewReportDTO reportDetail = adminReviewReportDAO.selectReviewReportById(reportId);
            if (reportDetail != null && reportDetail.getReviewId() != null) {
                int deletedRows = adminReviewReportDAO.deleteReview(reportDetail.getReviewId());
                if (deletedRows > 0) {
                    actionTaken = "REVIEW_DELETED";
                    System.out.println("리뷰 (ID: " + reportDetail.getReviewId() + ")가 삭제되었습니다.");
                } else {
                    actionTaken = "REVIEW_NOT_FOUND_OR_ALREADY_DELETED";
                    System.out.println("경고: 리뷰 (ID: " + reportDetail.getReviewId() + ")를 찾을 수 없거나 이미 삭제되었습니다. 신고만 처리합니다.");
                }
            } else {
                throw new IllegalArgumentException("처리할 신고 또는 리뷰 ID를 찾을 수 없습니다 (reportId: " + reportId + ")");
            }
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            newStatus = "REJECTED";
            actionTaken = "REPORT_REJECTED";
        } else {
            throw new IllegalArgumentException("유효하지 않은 신고 처리 액션입니다: " + request.getAction());
        }

        int updatedRows = adminReviewReportDAO.updateReviewReportStatus(
                reportId,
                newStatus,
                request.getAdminId(),
                actionTaken,
                request.getMemo()
        );

        if (updatedRows == 0) {
            throw new RuntimeException("신고 (ID: " + reportId + ") 업데이트에 실패했습니다. 이미 처리되었거나 존재하지 않는 신고일 수 있습니다.");
        }
    }
}