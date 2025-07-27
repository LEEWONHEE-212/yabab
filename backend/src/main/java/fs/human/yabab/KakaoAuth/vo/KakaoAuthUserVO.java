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
    private String userPhone;
    private String userFavoriteTeam; // 추가: 사용자의 응원하는 팀
    private String userImagePath;    // 추가: 서버에 저장된 프로필 이미지 경로 (선택적)
    private String userImageName;    // 추가: 서버에 저장된 프로필 이미지 파일명 (선택적)
}
