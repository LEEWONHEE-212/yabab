package fs.human.yabab.RestaurantReview.vo;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantReviewDTO {

    private Long id; // 식당의 고유 ID (DB의 RESTAURANT_ID)
    private String ownerId; // 식당 소유주 ID
    private String restaurantName; // 식당 이름
    private String restaurantImagePath; // 이미지 파일이 저장된 경로 (예: /uploads/restaurant_images/restaurant_1.jpg)
    private String restaurantImageName; // 이미지 파일의 원래 이름 (예: abc.jpg)
    private Long stadiumId; // 소속된 구장의 ID
    private String stadiumName; // 소속된 구장의 이름 (JOIN 필요)
    private Integer restaurantResvStatus; // 예약 가능 여부 (0: 가능, 1: 불가능)
    // 구장 내부 식당 관련 필드
    private String zoneName; // 구역 이름 (ZONE_ID -> ZONE_NAME 변환 필요)
    private String restaurantLocation; // 상세 주소/위치 (예: 1루 내야석 3층)

    //별점 평균 및 리뷰 개수
    private Double averageRating;
    private Integer reviewCount;

    private List<ReviewDetailDTO> reviews;

    private LocalDateTime createdDate; // 식당 자체의 생성일
    private String createdBy; // 식당 자체의 생성자
    private LocalDateTime updatedDate; // 식당 자체의 수정일
    private String updatedBy; // 식당 자체의 수정자

    private List<Restaurant_MenuDTO> menus;
}
