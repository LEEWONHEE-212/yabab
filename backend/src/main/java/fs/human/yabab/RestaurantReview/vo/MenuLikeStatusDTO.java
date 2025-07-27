package fs.human.yabab.RestaurantReview.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MenuLikeStatusDTO {
    private Long menuId;        // 메뉴의 고유 ID
    private String userId;      // (선택 사항) 해당 상태를 요청한 사용자의 ID (사용자별 상태를 나타낼 때 유용)
    private int likeCount;      // 해당 메뉴의 총 좋아요 수
    private boolean isLikedByUser; // 현재 사용자가 이 메뉴에 좋아요를 눌렀는지 여부
}
