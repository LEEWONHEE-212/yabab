package fs.human.yabab.ReviewReport.dao;

import fs.human.yabab.ReviewReport.vo.ReviewReportDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param; // 여러 파라미터 전달 시 사용

import java.util.List;

@Mapper // MyBatis 매퍼 인터페이스임을 나타냅니다.
public interface ReviewReportDAO {

    /**
     * 새로운 리뷰 신고 정보를 데이터베이스의 TB_REPORT 테이블에 삽입합니다.
     * REPORT_ID는 Oracle의 IDENTITY 컬럼에 의해 자동 생성됩니다.
     * CREATED_DATE, STATUS는 테이블의 DEFAULT 값 (SYSDATE, 'PENDING')에 의해 자동 설정됩니다.
     *
     * @param reviewReportDTO 삽입할 리뷰 신고 정보를 담은 ReviewReportDTO 객체
     * @return 삽입된 행의 수 (보통 1)
     */
    int insertReport(ReviewReportDTO reviewReportDTO);

    /**
     * 특정 신고 ID로 신고 정보를 조회합니다.
     * @param reportId 조회할 신고의 ID
     * @return 해당 신고 정보 (없으면 null)
     */
    ReviewReportDTO selectReportById(Long reportId);

    /**
     * 특정 리뷰 ID에 해당하는 모든 신고 목록을 조회합니다.
     * @param reviewId 신고 대상 리뷰의 ID
     * @return 해당 리뷰에 대한 신고 목록
     */
    List<ReviewReportDTO> selectReportsByReviewId(Long reviewId);

    /**
     * 신고 상태를 업데이트합니다.
     * @param reportId 업데이트할 신고의 ID
     * @param status 변경할 상태 (예: 'REVIEWED', 'RESOLVED', 'REJECTED')
     * @param updatedBy 처리한 관리자 ID (UPDATED_BY)
     * @return 업데이트된 행의 수 (보통 1)
     */
    int updateReportStatus(@Param("reportId") Long reportId,
                           @Param("status") String status,
                           @Param("updatedBy") String updatedBy);

    /**
     * 신고 처리 세부 정보를 업데이트합니다. (관리자용)
     * @param reportId 업데이트할 신고의 ID
     * @param status 변경할 상태
     * @param processedBy 처리한 관리자 ID (PROCESSED_BY)
     * @param actionTaken 취해진 조치
     * @param memo 관리자 메모
     * @param updatedBy 업데이트를 수행한 관리자 ID (UPDATED_BY)
     * @return 업데이트된 행의 수
     */
    int updateReportProcessedDetails(@Param("reportId") Long reportId,
                                     @Param("status") String status,
                                     @Param("processedBy") String processedBy,
                                     @Param("actionTaken") String actionTaken,
                                     @Param("memo") String memo,
                                     @Param("updatedBy") String updatedBy);
}