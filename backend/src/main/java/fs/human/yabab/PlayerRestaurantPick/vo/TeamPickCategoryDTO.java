package fs.human.yabab.PlayerRestaurantPick.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamPickCategoryDTO {
    private String id; // 팀 ID (예: "HanwhaEagles")
    private String name; // 팀 이름 (예: "한화 이글스")
    private YoutubeChannelDTO youtubeChannel; // 유튜브 채널 정보
    private List<PlayerPickCombinedDTO> restaurants; // 해당 팀의 선수 추천 맛집 목록
}
