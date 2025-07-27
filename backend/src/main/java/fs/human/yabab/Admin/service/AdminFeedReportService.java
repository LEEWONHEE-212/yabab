// src/main/java/fs/human/yabab/Admin/service/AdminFeedReportService.java
package fs.human.yabab.Admin.service;

import fs.human.yabab.Admin.dao.AdminFeedReportDAO;
import fs.human.yabab.Admin.vo.AdminFeedReportDTO;
import fs.human.yabab.Admin.vo.AdminFeedRequestDTO;
import fs.human.yabab.Admin.vo.AdminPageResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminFeedReportService {

    private final AdminFeedReportDAO adminFeedReportDAO;

    @Autowired
    public AdminFeedReportService(AdminFeedReportDAO adminFeedReportDAO) {
        this.adminFeedReportDAO = adminFeedReportDAO;
    }

    @Transactional(readOnly = true)
    public AdminPageResponseDTO<AdminFeedReportDTO> getFeedReports(
            String feedTitle, String feedContent,
            String reporterEmail, String reportedUserEmail,
            String status, AdminFeedRequestDTO requestDTO) {

        int page = requestDTO.getPage() < 0 ? 0 : requestDTO.getPage();
        int size = requestDTO.getSize() <= 0 ? 10 : requestDTO.getSize();
        String sortBy = requestDTO.getSortBy() == null || requestDTO.getSortBy().isEmpty() ? "CREATED_DATE" : requestDTO.getSortBy();
        String sortDirection = requestDTO.getSortDirection() == null || requestDTO.getSortDirection().isEmpty() ? "desc" : requestDTO.getSortDirection();

        int offset = page * size;

        long totalElements = adminFeedReportDAO.countFeedReports(
                feedTitle, feedContent, reporterEmail, reportedUserEmail, status);

        List<AdminFeedReportDTO> content = adminFeedReportDAO.selectFeedReports(
                feedTitle, feedContent, reporterEmail, reportedUserEmail, status,
                sortBy, sortDirection,
                offset, size);

        int totalPages = (int) Math.ceil((double) totalElements / size);
        boolean last = (page + 1) >= totalPages;
        boolean first = (page == 0);

        return new AdminPageResponseDTO<>(content, page, size, totalElements, totalPages, last, first);
    }

    @Transactional(readOnly = true)
    public AdminFeedReportDTO selectFeedReportById(Long feedReportId) {
        return adminFeedReportDAO.selectFeedReportById(feedReportId);
    }

    @Transactional
    public boolean processFeedReport(
            Long feedReportId, String newStatus, String processedBy,
            String actionTaken, String memo) {

        AdminFeedReportDTO report = adminFeedReportDAO.selectFeedReportById(feedReportId);
        if (report == null) {
            throw new IllegalArgumentException("Feed report with ID " + feedReportId + " not found.");
        }

        int updatedReportRows = adminFeedReportDAO.updateFeedReportStatus(feedReportId, newStatus, processedBy, actionTaken, memo);
        if (updatedReportRows == 0) {
            return false;
        }

        if ("ACCEPTED".equals(newStatus)) {
            // ⭐ Ensure report.getFeedId() is Long and passed correctly ⭐
            if (report.getFeedId() != null) {
                adminFeedReportDAO.updateFeedDeletedFlag(report.getFeedId(), processedBy);
                System.out.println("DEBUG: Feed ID " + report.getFeedId() + " soft-deleted due to accepted report.");
            } else {
                System.err.println("WARNING: No associated feed ID found for report ID " + feedReportId + ". Feed not deleted.");
            }
        }
        return true;
    }
}
