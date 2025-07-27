package fs.human.yabab.Admin.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import fs.human.yabab.common.BaseVO;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewReportDTO extends BaseVO{
    // 1. 신고 ID
    private Long reportId; // TB_REPORT.REPORT_ID

    // 2. 신고 대상 리뷰 ID (TB_REPORT의 REVIEW_ID)
    private Long reviewId;

    // 3. 신고자 정보 필드 (TB_REPORT.REPORTER_USER_ID 및 TB_USER 조인 결과)
    private String reporterUserId; // TB_REPORT.REPORTER_USER_ID
    private String reporterUserName; // TB_USER.USER_NAME (신고자)
    private String reporterUserNickname; // TB_USER.USER_NICKNAME (신고자)
    private String reporterUserEmail; // TB_USER.USER_EMAIL (신고자)

    // 4. 신고당한자 정보 필드 (TB_REPORT.REPORTED_USER_ID 및 TB_USER 조인 결과)
    private String reportedUserId; // TB_REPORT.REPORTED_USER_ID
    private String reportedUserName; // TB_USER.USER_NAME (신고당한자)
    private String reportedUserNickname; // TB_USER.USER_NICKNAME (신고당한자)
    private String reportedUserEmail; // TB_USER.USER_EMAIL (신고당한자)

    // 5. 신고 사유
    private String reportReason; // TB_REPORT.REPORT_REASON

    // 6. 상세 신고 사유
    private String reportDetails; // TB_REPORT.REPORT_DETAILS

    // 7. 신고가 접수된 날짜
    private Date createdDate; // TB_REPORT.CREATED_DATE

    // 그 외 신고 관리 관련 필드 (TB_REPORT 테이블에 존재)
    private String status; // TB_REPORT.STATUS
    private String processedBy; // TB_REPORT.PROCESSED_BY (처리한 관리자 ID)
    private Date processedDate; // TB_REPORT.PROCESSED_DATE
    private String actionTaken; // TB_REPORT.ACTION_TAKEN (취해진 조치)
    private String memo; // TB_REPORT.MEMO (관리자 메모)

    // 원본 리뷰 정보 필드 (TB_REVIEW 조인 결과)
    // reviewId는 이미 위에서 선언되었으므로, content와 authorId만 추가
    private String originalReviewContent; // TB_REVIEW.CONTENT (원본 리뷰 내용)
    private String originalReviewAuthorId; // TB_REVIEW.AUTHOR_ID (원본 리뷰 작성자 ID)
    // 추가적으로 필요한 리뷰 필드가 있다면 여기에 직접 추가합니다.
    // private Date originalReviewDate; // TB_REVIEW.REVIEW_DATE
    // private String originalReviewStoreId; // TB_REVIEW.STORE_ID
}