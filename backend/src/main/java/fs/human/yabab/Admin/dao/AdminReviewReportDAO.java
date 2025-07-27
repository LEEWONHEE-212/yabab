package fs.human.yabab.Admin.dao;

import fs.human.yabab.Admin.vo.AdminReviewReportDTO;
import fs.human.yabab.Admin.vo.AdminReviewReportSearchRequestDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminReviewReportDAO {
    List<AdminReviewReportDTO> selectReviewReports(AdminReviewReportSearchRequestDTO adminReviewReportSearchRequestDTO);

    // 새로 추가된 메서드
    int selectReviewReportsCount(AdminReviewReportSearchRequestDTO adminReviewReportSearchRequestDTO);

    AdminReviewReportDTO selectReviewReportById(Long reportId);

    int updateReviewReportStatus(@Param("reportId") Long reportId,
                                 @Param("newStatus") String newStatus,
                                 @Param("processedBy") String processedBy,
                                 @Param("actionTaken") String actionTaken,
                                 @Param("memo") String memo);

    // 신고 수락 시 리뷰를 삭제하기 위한 메서드 (TB_REVIEW 테이블에 대한 DAO가 필요할 수 있음)
    // 임시로 여기에 추가하지만, ReviewDAO 등으로 분리하는 것이 좋습니다.
    // 여기서는 간단하게 TB_REVIEW의 ID를 받아서 삭제하는 쿼리를 가정합니다.
    int deleteReview(@Param("reviewId") Long reviewId);
}
