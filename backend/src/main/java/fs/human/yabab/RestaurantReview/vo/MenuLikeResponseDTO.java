package fs.human.yabab.RestaurantReview.vo;

import fs.human.yabab.common.BaseVO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MenuLikeResponseDTO extends BaseVO{
    private Long likeId;        // 생성된 좋아요의 고유 ID
    private Long menuId;        // 좋아요가 적용된 메뉴의 ID
    private String userId;      // 좋아요를 누른 사용자의 ID
}
