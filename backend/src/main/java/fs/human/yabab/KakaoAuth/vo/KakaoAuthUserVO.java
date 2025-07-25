package fs.human.yabab.KakaoAuth.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // @Getter, @Setter, @EqualsAndHashCode, @ToString을 한 번에 제공
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor // 모든 필드를 포함하는 생성자
public class KakaoAuthUserVO {
    private String userId;
    private String userPassword; // 소셜 로그인 시에는 임의의 값 저장
    private String userName;
    private String userNickname;
    private String userEmail;
    // 다른 사용자 관련 필드가 있다면 추가
}
