package fs.human.yabab.auth.vo;

import lombok.*;

import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "authCode")
public class ResetTokenVO {
    private String tokenId;
    private String targetEmail;     //  인증/재설정 대상 이메일
    private String authCode;        //  메일에서 보낼 6자리 코드
    private Date expiredTime;       //  만료 시각
    private int usedFlag;           //  0: 미사용, 1: 사용완료

    //  생성자
    public ResetTokenVO(String email, String code, Date expired) {
        this.tokenId = UUID.randomUUID().toString();
        this.targetEmail = email;
        this.authCode = code;
        this.expiredTime = expired;
        this.usedFlag = 0;
    }
}
