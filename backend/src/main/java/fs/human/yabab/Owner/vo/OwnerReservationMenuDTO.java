package fs.human.yabab.Owner.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import fs.human.yabab.common.BaseVO;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OwnerReservationMenuDTO extends BaseVO{
    private Long resvMenuId; // RESV_MENU_ID (NUMBER)
    private Long resvId; // RESV_ID (NUMBER) - TB_RESERVATION의 RESV_ID와 연결
    private Long menuId; // MENU_ID (NUMBER) - TB_MENU의 MENU_ID와 연결될 수 있음
    private Integer quantity; // QUANTITY (NUMBER) - 주문 수량

    // TB_MENU에서 조인하여 가져올 필드 추가
    private String menuName; // MENU_NAME (VARCHAR2)
    private Integer menuPrice; // MENU_PRICE (NUMBER)
}
