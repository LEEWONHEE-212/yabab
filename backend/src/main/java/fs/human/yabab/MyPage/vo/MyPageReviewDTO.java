package fs.human.yabab.MyPage.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MyPageReviewDTO {
    private Long reviewId; // REVIEW_ID (NUMBER -> Long)
    private String authorNickname; // TB_USER에서 가져올 닉네임
    private String restaurantName; // TB_RESTAURANT 테이블에서 가져올 이름 (가정)
    private String content; // REVIEW_CONTENT
    private Integer rating; // REVIEW_RATING
    private String reviewImageUrl; // REVIEW_IMAGE_PATH + REVIEW_IMAGE_NAME 조합 또는 이미지 URL
    private LocalDateTime createdAt; // CREATED_DATE (DATE -> LocalDateTime)
    private Integer likesCount; // TB_REVIEW_LIKE 등에서 집계 (없으면 0으로 고정)
    private Integer commentsCount;
}
