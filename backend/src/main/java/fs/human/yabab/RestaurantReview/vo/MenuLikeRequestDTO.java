package fs.human.yabab.RestaurantReview.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 메뉴 좋아요/좋아요 취소 요청 시 클라이언트로부터 받는 데이터를 위한 DTO.
 * 좋아요를 누른 메뉴 ID와 사용자 ID를 포함합니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MenuLikeRequestDTO {
    private Long menuId;   // 좋아요를 누른 메뉴의 고유 ID
    private String userId; // 좋아요를 누른 사용자의 고유 ID

}