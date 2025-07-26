package fs.human.yabab.PlayerRestaurantPick.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerPickCombinedDTO {
    private Long id; // RESTAURANT_ID (TB_PLAYER_PICK, TB_RESTAURANT)
    private String name; // RESTAURANT_NAME (TB_RESTAURANT)
    private String image; // RESTAURANT_IMAGE_PATH (TB_RESTAURANT)
    private String TeamName;
    private String player; // PICK_PLAYER_NAME (TB_PLAYER_PICK)
    private String reason; // PICK_COMMENT (TB_PLAYER_PICK)
    private String sourceUrl; // PICK_SOURCE_URL (TB_PLAYER_PICK)
}

