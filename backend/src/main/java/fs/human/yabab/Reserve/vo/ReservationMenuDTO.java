package fs.human.yabab.Reserve.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import fs.human.yabab.common.BaseVO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationMenuDTO extends BaseVO {
    private Long resvMenuId;
    private Long resvId; // TB_RESERVATION의 RESV_ID에 해당
    private Long menuId;
    private Integer quantity;
    private Double menuPriceAtResv;
}
