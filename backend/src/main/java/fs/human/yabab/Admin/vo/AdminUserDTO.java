// src/main/java/fs/human/yabab/Admin/vo/AdminUserDTO.java

package fs.human.yabab.Admin.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserDTO {
    private String userId;           // USER_ID
    private String userNickname;     // USER_NICKNAME
    private String userEmail;        // USER_EMAIL
    private Integer userRole;        // USER_ROLE
    private LocalDateTime userJoindate; // USER_JOINDATE
    private Integer userDeletedFlag; // <<< 이 필드를 추가해야 합니다!

    /**
     * 회원 역할 코드를 한글 텍스트로 변환하는 헬퍼 메서드
     * @return 역할에 해당하는 한글 문자열 (예: "관리자", "일반 사용자", "사장님")
     */
    public String getUserRoleText() {
        if (this.userRole == null) {
            return "알 수 없음";
        }
        switch (this.userRole) {
            case 0: return "관리자";
            case 1: return "일반 사용자";
            case 2: return "사장님";
            default: return "알 수 없음";
        }
    }
}