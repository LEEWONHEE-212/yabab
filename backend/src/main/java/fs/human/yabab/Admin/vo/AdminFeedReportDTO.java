// src/main/java/fs/human/yabab/Admin/vo/AdminFeedReportDTO.java
package fs.human.yabab.Admin.vo; // 패키지 경로 변경

import lombok.*;

import java.util.Date;
import fs.human.yabab.common.BaseVO;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AdminFeedReportDTO extends BaseVO{ // 클래스 이름도 AdminFeedReportDTO로 변경
    private Long feedReportId;
    private Long feedId;
    private String reporterUserId;
    private String reportedUserId;
    private String reportReason;
    private String reportDetails;
    private String status; // 'PENDING', 'ACCEPTED', 'REJECTED'
    private String processedBy;
    private Date processedDate;
    private String actionTaken;
    private String memo;

    // Frontend search/display fields (will be populated via JOINs in DAO)
    private String feedTitle;
    private String feedContent;
    private String reporterEmail;
    private String reportedUserEmail;
}
