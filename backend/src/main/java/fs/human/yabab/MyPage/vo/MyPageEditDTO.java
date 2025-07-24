package fs.human.yabab.MyPage.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MyPageEditDTO {
    private String userId; // 회원 고유 ID (TB_USER.user_id) - 수정 대상 식별용
    private String userNickname;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String userFavoriteTeam;
    private String userImagePath; // ex: /profile_images/
    private String userImageName; // ex: user123_profile.jpg
}
