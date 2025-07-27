// src/main/java/fs/human/yabab/Admin/vo/AdminFeedRequestDTO.java
package fs.human.yabab.Admin.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AdminFeedRequestDTO {
    private int page;            // 요청 페이지 번호 (0부터 시작)
    private int size;            // 한 페이지당 가져올 항목 수
    private String sortBy;       // 정렬 기준이 될 컬럼명 (예: "CREATED_DATE", "FEED_REPORT_ID")
    private String sortDirection; // 정렬 방향 ("asc" 또는 "desc")

}
