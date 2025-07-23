package fs.human.yabab.Owner.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import fs.human.yabab.common.BaseVO;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OwnerDTO  extends BaseVO{
    private Long id;
    private String ownerId;
    private String restaurantName;
    private String restaurantImagePath; // 이미지 파일이 저장된 경로 (예: /uploads/restaurant_images/)
    private String restaurantImageName; // 이미지 파일의 이름 (예: abc.jpg)

    private String stadiumName; // 구장 이름

    //구장 내부 식당 관련 필드
    private String zoneName; // 구역 이름 (ZONE_ID -> ZONE_NAME 변환 필요)
    private String restaurantLocation; // 상세 주소 (RESTAURANT_LOCATION)

    //구장 외부 식당 관련 필드
    private String restaurantAddr1;
    private String restaurantAddr2; // 상세 구역/상세 주소 (RESTAURANT_ADDR2)

    private Integer restaurantInsideFlag; // 구장 내부/외부 여부 (RESTAURANT_INSIDE_FLAG)

    private String restaurantPhone; // 식당 전화번호 (RESTAURANT_TEL)
    private String restaurantOpenTime; // 오픈 시간 (RESTAURANT_OPEN_TIME)
    private String restaurantLastOrder; // 라스트 오더 시간 (RESTAURANT_LAST_ORDER)
    private String restaurantBreakTime; // 브레이크 타임 (RESTAURANT_BREAK_TIME)
    private String restaurantRestDay; // 휴무일 (RESTAURANT_REST_DAY)
    private Integer restaurantResvStatus; // 예약 가능 여부 (RESTAURANT_RESV_STATUS)

    //메뉴 정보를 추가합니다.
    private List<Owner_MenuDTO> menuItems;
}
