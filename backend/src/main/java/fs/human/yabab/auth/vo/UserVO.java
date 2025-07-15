package fs.human.yabab.auth.vo;

import fs.human.yabab.common.BaseVO;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "userPassword")
public class UserVO extends BaseVO {
    private String userId;
    private String userName;
    private String userNickname;
    private String userEmail;
    private String userPassword;
    private String userPhone;
    private int userRole;   //  1: 일반 사용자, 2: 사장, 0: 관리자(관리자는 시스템에서만 입력)

    private String userImagePath;
    private String userImageName;
    private Date userJoindate;
    private String userFavoriteTeam;
}
