package fs.human.yabab.RestaurantReview.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import fs.human.yabab.common.BaseVO;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDetailDTO extends BaseVO{
    private Long reviewId;
    private String userId; // 리뷰 작성자 ID (USER_ID)
    private String reviewContent;
    private Integer reviewRating;
    private String reviewImagePath;
    private String reviewImageName;
}
