package fs.human.yabab.PlayerRestaurantPick.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantVO {
    private Long restaurantId; // RESTAURANT_ID (NUMBER)
    private String ownerId; // OWNER_ID (VARCHAR2)
    private Long stadiumId; // STADIUM_ID (NUMBER)
    private Long zoneId; // ZONE_ID (NUMBER)
    private String restaurantName; // RESTAURANT_NAME (VARCHAR2)
    private String restaurantAddr1; // RESTAURANT_ADDR1 (VARCHAR2)
    private String restaurantAddr2; // RESTAURANT_ADDR2 (VARCHAR2)
    private String restaurantLocation; // RESTAURANT_LOCATION (VARCHAR2)
    private Double restaurantMapx; // RESTAURANT_MAPX (NUMBER(10,7))
    private Double restaurantMapy; // RESTAURANT_MAPY (NUMBER(10,7))
    private Integer restaurantInsideFlag; // RESTAURANT_INSIDE_FLAG (NUMBER(1,0))
    private String restaurantTel; // RESTAURANT_TEL (VARCHAR2)
    private String restaurantImagePath; // RESTAURANT_IMAGE_PATH (VARCHAR2)
    private String restaurantImageName; // RESTAURANT_IMAGE_NAME (VARCHAR2)
    private String restaurantOpenTime; // RESTAURANT_OPEN_TIME (VARCHAR2)
    private String restaurantLastOrder; // RESTAURANT_LAST_ORDER (VARCHAR2)
    private String restaurantBreakTime; // RESTAURANT_BREAK_TIME (VARCHAR2)
    private String restaurantRestDay; // RESTAURANT_REST_DAY (VARCHAR2)
    private Integer restaurantResvStatus; // RESTAURANT_RESV_STATUS (NUMBER(1,0))
    private Date createdDate; // CREATED_DATE (DATE)
    private String createdBy; // CREATED_BY (VARCHAR2)
    private Date updatedDate; // UPDATED_DATE (DATE)
    private String updatedBy; // UPDATED_BY (VARCHAR2)
}
