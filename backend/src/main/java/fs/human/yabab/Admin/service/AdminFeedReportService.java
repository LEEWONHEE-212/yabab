// src/main/java/fs/human/yabab/Admin/service/AdminFeedReportService.java
package fs.human.yabab.Admin.service; // 패키지 경로 변경

import fs.human.yabab.Admin.dao.AdminFeedReportDAO; // DAO 임포트 경로 변경
import fs.human.yabab.Admin.vo.AdminFeedReportDTO; // DTO 임포트 경로 변경
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminFeedReportService { // 서비스 이름도 AdminFeedReportService로 변경

    private final AdminFeedReportDAO adminFeedReportDAO; // DAO 필드명 변경

    @Autowired
    public AdminFeedReportService(AdminFeedReportDAO adminFeedReportDAO) { // 생성자 파라미터 변경
        this.adminFeedReportDAO = adminFeedReportDAO;
    }

    /**
     * 게시물 신고 목록을 조회합니다.
     * @param feedTitle 게시물 제목 검색어
     * @param feedContent 게시물 내용 검색어
     * @param reporterEmail 신고자 이메일 검색어
     * @param reportedUserEmail 대상 회원 이메일 검색어
     * @param status 신고 처리 상태 ('PENDING', 'ACCEPTED', 'REJECTED')
     * @return 검색 및 필터링된 신고 목록
     */
    @Transactional(readOnly = true)
    public List<AdminFeedReportDTO> getFeedReports(
            String feedTitle, String feedContent,
            String reporterEmail, String reportedUserEmail,
            String status) { // status 타입 String으로 변경
        return adminFeedReportDAO.selectFeedReports(feedTitle, feedContent, reporterEmail, reportedUserEmail, status);
    }

    /**
     * 신고를 처리하고 상태를 업데이트합니다.
     * 신고 수락 시 해당 게시물을 삭제 처리합니다.
     * @param feedReportId 처리할 신고 ID
     * @param newStatus 새로운 상태 ('ACCEPTED', 'REJECTED')
     * @param processedBy 처리한 관리자 ID
     * @param actionTaken 취해진 조치
     * @param memo 관리자 메모
     * @return 처리 성공 여부
     */
    @Transactional
    public boolean processFeedReport(
            Long feedReportId, String newStatus, String processedBy,
            String actionTaken, String memo) {

        // 1. 신고 상세 정보 조회 (게시물 ID 확인 위함)
        AdminFeedReportDTO report = adminFeedReportDAO.selectFeedReportById(feedReportId);
        if (report == null) {
            throw new IllegalArgumentException("신고 ID " + feedReportId + "를 찾을 수 없습니다.");
        }

        // 2. 신고 상태 업데이트
        int updatedReportRows = adminFeedReportDAO.updateFeedReportStatus(feedReportId, newStatus, processedBy, actionTaken, memo);
        if (updatedReportRows == 0) {
            return false; // 신고 상태 업데이트 실패
        }

        // 3. 신고가 '수락'되었을 경우, 해당 게시물을 삭제 처리
        if ("ACCEPTED".equals(newStatus)) {
            if (report.getFeedId() != null) { // 게시물 신고인 경우
                adminFeedReportDAO.updateFeedDeletedFlag(report.getFeedId(), processedBy);
                System.out.println("DEBUG: 게시물 ID " + report.getFeedId() + " 삭제 처리됨 (신고 수락).");
            } else {
                System.err.println("WARNING: 신고 ID " + feedReportId + "에 연결된 게시물 ID가 없어 삭제 처리할 수 없습니다.");
            }
        }
        return true;
    }
}
