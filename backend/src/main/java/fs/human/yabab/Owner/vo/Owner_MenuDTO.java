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
public class Owner_MenuDTO extends  BaseVO{
    private Long menuId; // MENU_ID
    private Long restaurantId; // RESTAURANT_ID
    private String menuName; // MENU_NAME
    private Integer menuPrice; // MENU_PRICE (가격은 정수형이 일반적이므로 Integer로 가정)
}
