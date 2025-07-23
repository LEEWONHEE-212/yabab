package fs.human.yabab.AddRestaurant.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BizCheckResponse {
    private boolean valid;       // 유효 여부
    private String message;      // 결과 메시지
    private String b_stt;        // 사업자 상태
    private String b_nm;         // 상호명
    private String b_no;         // 사업자 번호
    private String p_nm;         // 대표자명 (필요하면)
    private String start_dt;     // 개업일자 (필요하면)
}
