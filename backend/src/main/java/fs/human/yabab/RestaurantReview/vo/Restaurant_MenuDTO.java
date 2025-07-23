package fs.human.yabab.RestaurantReview.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import fs.human.yabab.common.BaseVO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant_MenuDTO extends BaseVO{
    private Long menuId;
    private Long restaurantId;
    private String menuName;
    private int menuPrice;
}
