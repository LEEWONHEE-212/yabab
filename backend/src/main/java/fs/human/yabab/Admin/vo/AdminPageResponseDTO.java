// src/main/java/fs/human/yabab/Admin/vo/AdminPageResponseDTO.java

package fs.human.yabab.Admin.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPageResponseDTO<T> {
    private List<T> content;     // 현재 페이지의 데이터 목록 (예: List<AdminUserDTO>)
    private int pageNumber;      // 현재 페이지 번호 (0부터 시작)
    private int pageSize;        // 페이지당 항목 수
    private long totalElements;  // 전체 항목 수
    private int totalPages;      // 전체 페이지 수
    private boolean last;        // 마지막 페이지인지 여부
    private boolean first;       // 첫 페이지인지 여부
}