package fs.human.yabab.Admin.vo;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminProcessRequestDTO {
    private String action; // "ACCEPT" 또는 "REJECT" (신고 처리 액션)
    private String adminId; // 처리한 관리자 ID
    private String memo; // (선택 사항) 관리자 메모
}