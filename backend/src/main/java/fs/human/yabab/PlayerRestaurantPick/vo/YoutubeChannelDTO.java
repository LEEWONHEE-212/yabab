package fs.human.yabab.PlayerRestaurantPick.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class YoutubeChannelDTO {
    private String name; // 유튜브 채널 이름 (예: "한화이글스 TV")
    private String url; // 유튜브 채널 URL (예: "https://www.youtube.com/@hanwhaeagles")
}
