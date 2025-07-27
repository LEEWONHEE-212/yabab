package fs.human.yabab.KakaoAuth.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor // 모든 필드를 포함하는 생성자 (이제 user, token 두 개만 포함)
public class UserLoginResponse {
    // private String userId; // <-- 이 줄을 삭제합니다!

    private KakaoAuthUserVO user; // 이제 이 필드만 남습니다.
    private String token; // 서비스에서 발급하는 JWT 등

    // 오류 응답을 위한 생성자: user 객체 없이 메시지만 전달할 경우
    public UserLoginResponse(String errorMessage) {
        this.user = null; // 사용자 정보는 null
        this.token = errorMessage; // 토큰 필드에 오류 메시지를 담음
    }
}
