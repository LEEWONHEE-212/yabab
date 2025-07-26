// src/main/java/fs/human/yabab/Admin/dao/AdminFeedReportDAO.java
package fs.human.yabab.Admin.dao; // 패키지 경로 변경

import fs.human.yabab.Admin.vo.AdminFeedReportDTO; // DTO 임포트 경로 변경
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface AdminFeedReportDAO { // 인터페이스 이름도 AdminFeedReportDAO로 변경

    // 게시물 신고 목록 조회 (검색 및 필터링 포함)
    List<AdminFeedReportDTO> selectFeedReports(
            @Param("feedTitle") String feedTitle,
            @Param("feedContent") String feedContent,
            @Param("reporterEmail") String reporterEmail,
            @Param("reportedUserEmail") String reportedUserEmail,
            @Param("status") String status // DDL STATUS가 VARCHAR2이므로 String으로 변경
    );

    // 신고 상태 업데이트
    int updateFeedReportStatus(
            @Param("feedReportId") Long feedReportId,
            @Param("status") String status, // 'ACCEPTED', 'REJECTED'
            @Param("processedBy") String processedBy,
            @Param("actionTaken") String actionTaken,
            @Param("memo") String memo
    );

    // 특정 신고 ID로 상세 정보 조회
    AdminFeedReportDTO selectFeedReportById(@Param("feedReportId") Long feedReportId);

    // 게시물 삭제 플래그 업데이트 (신고 수락 시)
    int updateFeedDeletedFlag(@Param("feedId") String feedId, @Param("deletedBy") String deletedBy); // feedId 타입 String으로 변경
}
