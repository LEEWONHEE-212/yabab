package fs.human.yabab.Admin.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewReportSearchRequestDTO {
    // 검색 조건 (프론트엔드 ReviewReportList.jsx의 searchType/searchTerm에 대응)
    private String searchType; // "reviewContent", "reporterEmail", "reportedUserEmail"
    private String searchTerm; // 검색어

    // 필터 조건 (프론트엔드 ReviewReportList.jsx의 filterStatus에 대응)
    private Integer status; // 0: 대기 (PENDING), 1: 수락 (ACCEPTED), 2: 거절 (REJECTED)
    // null이면 모든 상태 조회

    // 페이징 정보
    private int page; // 페이지 번호 (0부터 시작)
    private int size; // 페이지당 항목 수

    // 정렬 정보 (필요하다면 추가)
    // private String sortBy; // 정렬 기준 컬럼
    // private String sortDirection; // "asc" 또는 "desc"
}