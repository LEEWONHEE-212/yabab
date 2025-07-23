package fs.human.yabab.AddRestaurant.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FullBizInfoCheckRequest {
    private String b_no;           // 사업자 등록번호
    private String restaurantName; // 프런트엔드에서 보낸 식당 이름 (상호명 비교용)
    private String start_dt;       // 개업일자 (YYYYMMDD 형식)
    private String p_nm;           // 대표자명
}
