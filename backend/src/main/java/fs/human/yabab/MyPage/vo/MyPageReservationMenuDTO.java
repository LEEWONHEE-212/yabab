package fs.human.yabab.MyPage.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MyPageReservationMenuDTO {
    private Long menuId; // MENU_ID
    private String menuName; // TB_MENU 테이블에서 가져올 이름 (가정)
    private Integer quantity; // QUANTITY
    private Long menuPriceAtReservation; // MENU_PRICE_AT_RESV (NUMBER -> Long)
}
