// src/main/java/fs/human/yabab/Admin/vo/AdminUserSearchRequestDTO.java

package fs.human.yabab.Admin.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserSearchRequestDTO {
    private String searchTerm;   // 검색어 (USER_ID, USER_NAME, USER_NICKNAME, USER_EMAIL)
    private String searchType;   // 검색 유형 (userId, userName, userNickname, userEmail) - 다시 추가됨
    private Integer userRole;    // 역할 필터 (유지)

    private int page;            // 요청 페이지 번호 (0부터 시작)
    private int size;            // 한 페이지당 가져올 항목 수
    private String sortBy;       // 정렬 기준이 될 컬럼명
    private String sortDirection; // 정렬 방향 ("asc" 또는 "desc")
}