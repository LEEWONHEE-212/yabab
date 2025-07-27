package fs.human.yabab.Stadium.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StadiumResDTO {
    private Long id;
    private String ownerId;
    private String restaurantName;
    private String restaurantImagePath; // 이미지 파일이 저장된 경로 (예: /uploads/restaurant_images/)
    private String restaurantImageName; // 이미지 파일의 이름 (예: abc.jpg)
    private Long stadiumId;
    private String stadiumName;
    private Integer restaurantResvStatus;
    private String stadiumImagePath;

    //구장 내부 식당 관련 필드
    private String zoneName; // 구역 이름 (ZONE_ID -> ZONE_NAME 변환 필요)
    private String restaurantLocation; // 상세 주소 (RESTAURANT_LOCATION)

    private Integer restaurantInsideFlag; // 구장 내부/외부 여부 (RESTAURANT_INSIDE_FLAG)

    private Double rating; // 별점평균
    private Integer reviewCount; // 리뷰 수
}
