// src/main/java/fs/human/yabab/Admin/dao/AdminFeedReportDAO.java
package fs.human.yabab.Admin.dao;

import fs.human.yabab.Admin.vo.AdminFeedReportDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface AdminFeedReportDAO {

    int countFeedReports(
            @Param("feedTitle") String feedTitle,
            @Param("feedContent") String feedContent,
            @Param("reporterEmail") String reporterEmail,
            @Param("reportedUserEmail") String reportedUserEmail,
            @Param("status") String status
    );

    List<AdminFeedReportDTO> selectFeedReports(
            @Param("feedTitle") String feedTitle,
            @Param("feedContent") String feedContent,
            @Param("reporterEmail") String reporterEmail,
            @Param("reportedUserEmail") String reportedUserEmail,
            @Param("status") String status,
            @Param("sortBy") String sortBy,
            @Param("sortDirection") String sortDirection,
            @Param("offset") int offset,
            @Param("limit") int limit
    );

    AdminFeedReportDTO selectFeedReportById(@Param("feedReportId") Long feedReportId);

    int updateFeedReportStatus(
            @Param("feedReportId") Long feedReportId,
            @Param("status") String status,
            @Param("processedBy") String processedBy,
            @Param("actionTaken") String actionTaken,
            @Param("memo") String memo
    );

    // ⭐ Changed feedId from String to Long ⭐
    int updateFeedDeletedFlag(@Param("feedId") Long feedId, @Param("deletedBy") String deletedBy);
}
