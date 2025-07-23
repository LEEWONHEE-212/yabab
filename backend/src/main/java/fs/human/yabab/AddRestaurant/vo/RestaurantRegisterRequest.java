package fs.human.yabab.AddRestaurant.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantRegisterRequest {
    // 식당 고유 ID (TB_RESTAURANT.RESTAURANT_ID)
    // 1회용 등록을 위해 클라이언트에서 1을 넘겨준다고 가정 (일반적이지 않은 사용 사례)
    private Long restaurantId;

    private String ownerId; // OWNER_ID (VARCHAR2 50 Byte) - DDL: NOT NULL
    private Long stadiumId; // STADIUM_ID (NUMBER) - DDL: NOT NULL
    private Long zoneId; // ZONE_ID (NUMBER) - DDL: NOT NULL
    private String restaurantName; // RESTAURANT_NAME (VARCHAR2 100 Byte) - DDL: NOT NULL

    private String restaurantAddr1; // RESTAURANT_ADDR1 (VARCHAR2 150 Byte) - DDL: NULLABLE
    private String restaurantAddr2; // RESTAURANT_ADDR2 (VARCHAR2 100 Byte) - DDL: NULLABLE
    private String restaurantLocation; // RESTAURANT_LOCATION (VARCHAR2 100 Byte) - DDL: NULLABLE

    private BigDecimal restaurantMapX; // RESTAURANT_MAPX (NUMBER 10,7) - DDL: NULLABLE
    private BigDecimal restaurantMapY; // RESTAURANT_MAPY (NUMBER 10,7) - DDL: NULLABLE

    private Boolean restaurantInsideFlag; // RESTAURANT_INSIDE_FLAG (NUMBER 1,0) - DDL: NOT NULL (0: 외부, 1: 내부)
    private String restaurantTel; // RESTAURANT_TEL (VARCHAR2 13 Byte) - DDL: NULLABLE

    private String restaurantImagePath; // RESTAURANT_IMAGE_PATH (VARCHAR2 255 Byte) - DDL: NULLABLE
    private String restaurantImageName; // RESTAURANT_IMAGE_NAME (VARCHAR2 100 Byte) - DDL: NULLABLE

    private String restaurantOpenTime; // RESTAURANT_OPEN_TIME (VARCHAR2 20 Byte) - DDL: NULLABLE
    private String restaurantLastOrder; // RESTAURANT_LAST_ORDER (VARCHAR2 20 Byte) - DDL: NULLABLE
    private String restaurantBreakTime; // RESTAURANT_BREAK_TIME (VARCHAR2 20 Byte) - DDL: NULLABLE
    private String restaurantRestDay; // RESTAURANT_REST_DAY (VARCHAR2 50 Byte) - DDL: NULLABLE

    private Boolean restaurantResvStatus; // RESTAURANT_RESV_STATUS (NUMBER 1,0) - DDL: NOT NULL (0: 예약 불가, 1: 예약 가능)
    private MultipartFile restaurantImageFile; // 파일 자체를 받기 위한 필드
}
