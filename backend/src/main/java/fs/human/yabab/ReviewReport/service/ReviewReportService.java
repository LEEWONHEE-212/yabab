package fs.human.yabab.ReviewReport.service;

import fs.human.yabab.ReviewReport.dao.ReviewReportDAO; // DAO 임포트
import fs.human.yabab.ReviewReport.vo.ReviewReportDTO; // DTO 임포트

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 트랜잭션 관리

import java.util.List;
// import java.util.Optional; // Optional 임포트 제거 (ReviewDAO.findById 사용하지 않으므로)
import java.util.stream.Collectors;

@Service
public class ReviewReportService {

    private final ReviewReportDAO reviewReportDAO;
    // private final ReviewDAO reviewDAO; // ReviewDAO 주입 제거

    @Autowired
    public ReviewReportService(ReviewReportDAO reviewReportDAO /* , ReviewDAO reviewDAO */) {
        this.reviewReportDAO = reviewReportDAO;
        // this.reviewDAO = reviewDAO;
    }

    /**
     * 새로운 리뷰 신고를 접수합니다.
     * @param reportDTO 신고 요청 정보를 담은 DTO
     * @return 저장된 신고 정보를 담은 DTO
     */
    @Transactional
    public ReviewReportDTO createReviewReport(ReviewReportDTO reportDTO) {
        // ⭐⭐ 1. 신고 대상 리뷰 유효성 확인 로직 제거 ⭐⭐
        // Optional<Review> reviewOptional = reviewDAO.findById(reportDTO.getReviewId());
        // Review review = reviewOptional.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다. reviewId: " + reportDTO.getReviewId()));

        // ⭐⭐ 2. 신고당한 사용자의 ID를 리뷰 정보에서 가져오는 로직 제거 ⭐⭐
        // reportedUserId는 DTO에 반드시 포함되어야 합니다.
        // String reportedUserId = reportDTO.getReportedUserId();
        // if (reportedUserId == null || reportedUserId.isEmpty()) {
        //     reportedUserId = review.getUserId();
        //     reportDTO.setReportedUserId(reportedUserId);
        // }
        // DTO에 reportedUserId가 이미 있다고 가정합니다.

        // 3. 감사(Audit) 필드 설정 (BaseVO에서 상속받은 필드)
        // CREATED_BY는 신고자를 생성자로 설정
        reportDTO.setCreatedBy(reportDTO.getReporterUserId());
        // STATUS는 기본값 'PENDING'으로 설정 (DB DEFAULT와 일치)
        if (reportDTO.getStatus() == null || reportDTO.getStatus().isEmpty()) {
            reportDTO.setStatus("PENDING");
        }
        // CREATED_DATE, UPDATED_DATE는 DB의 SYSDATE DEFAULT에 맡기거나, 여기서 LocalDateTime.now()로 설정 가능

        // 4. 신고 정보를 DB에 삽입
        reviewReportDAO.insertReport(reportDTO); // DTO를 직접 파라미터로 전달

        // 삽입 후 자동 생성된 reportId는 DTO의 reportId 필드에 자동으로 채워집니다 (XML의 useGeneratedKeys 덕분).
        return reportDTO;
    }

    /**
     * 특정 신고 ID로 신고 정보를 조회합니다.
     * @param reportId 조회할 신고의 ID
     * @return 조회된 신고 정보를 담은 DTO (없으면 null)
     */
    public ReviewReportDTO getReportById(Long reportId) {
        return reviewReportDAO.selectReportById(reportId); // DTO를 직접 반환
    }

    /**
     * 특정 리뷰 ID에 해당하는 모든 신고 목록을 조회합니다.
     * @param reviewId 신고 대상 리뷰의 ID
     * @return 해당 리뷰에 대한 신고 목록을 담은 DTO 리스트
     */
    public List<ReviewReportDTO> getReportsByReviewId(Long reviewId) {
        return reviewReportDAO.selectReportsByReviewId(reviewId); // DTO 리스트를 직접 반환
    }

    /**
     * 신고 상태를 업데이트합니다.
     * @param reportId 업데이트할 신고의 ID
     * @param status 변경할 상태
     * @param updatedBy 업데이트를 수행한 사용자 ID
     * @return 업데이트 성공 여부
     */
    @Transactional
    public boolean updateReportStatus(Long reportId, String status, String updatedBy) {
        // 유효한 상태 값인지 검증 로직 추가 가능
        return reviewReportDAO.updateReportStatus(reportId, status, updatedBy) > 0;
    }

    /**
     * 신고 처리 세부 정보를 업데이트합니다.
     * @param reportId 업데이트할 신고의 ID
     * @param reportDTO 업데이트할 정보를 담은 DTO
     * @return 업데이트 성공 여부
     */
    @Transactional
    public boolean updateReportProcessedDetails(Long reportId, ReviewReportDTO reportDTO) {
        // DTO에서 필요한 정보 추출 및 DAO 호출
        return reviewReportDAO.updateReportProcessedDetails(
                reportId,
                reportDTO.getStatus(),
                reportDTO.getProcessedBy(),
                reportDTO.getActionTaken(),
                reportDTO.getMemo(),
                reportDTO.getUpdatedBy() // 업데이트 수행자
        ) > 0;
    }
}