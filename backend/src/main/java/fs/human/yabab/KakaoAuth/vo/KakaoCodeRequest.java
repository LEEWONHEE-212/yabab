package fs.human.yabab.KakaoAuth.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KakaoCodeRequest {
    private String code; // 카카오로부터 받은 인가 코드
}
