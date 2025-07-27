package fs.human.yabab.PlayerRestaurantPick.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Date;

@Data // Getter, Setter, EqualsAndHashCode, ToString을 자동으로 생성
@NoArgsConstructor // 기본 생성자 자동 생성
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자 자동 생성
public class PlayerPickVO {
    private Long pickId; // PICK_ID (NUMBER)
    private Long restaurantId; // RESTAURANT_ID (NUMBER)
    private String pickPlayerName; // PICK_PLAYER_NAME (VARCHAR2)
    private String pickTeamName; // PICK_TEAM_NAME (VARCHAR2)
    private String pickComment; // PICK_COMMENT (VARCHAR2)
    private String pickSourceUrl; // PICK_SOURCE_URL (VARCHAR2)
    private Date createdDate; // CREATED_DATE (DATE)
    private String createdBy; // CREATED_BY (VARCHAR2)
    private Date updatedDate; // UPDATED_DATE (DATE)
    private String updatedBy; // UPDATED_BY (VARCHAR2)
}