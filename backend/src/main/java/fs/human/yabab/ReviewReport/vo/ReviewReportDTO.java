package fs.human.yabab.ReviewReport.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import fs.human.yabab.common.BaseVO;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReportDTO extends BaseVO{
    private Long reportId;
    private Long reviewId; // 신고 대상 리뷰의 ID
    private String reporterUserId; // 신고를 요청한 사용자의 ID
    private String reportedUserId; // 신고당한 리뷰를 작성한 사용자의 ID (프론트에서 전달)
    private String reportReason; // 신고 사유 (예: "ABUSE", "PORNOGRAPHY", "OTHER")
    private String reportDetails; // 상세 신고 사유 (선택 사항)
    private String status;
    private String processedBy;
    private LocalDateTime processedDate;
    private String actionTaken;
    private String memo;
}
