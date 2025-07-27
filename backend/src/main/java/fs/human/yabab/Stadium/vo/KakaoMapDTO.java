package fs.human.yabab.Stadium.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import fs.human.yabab.common.BaseVO;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class KakaoMapDTO extends BaseVO{
    private Long stadiumId; // STADIUM_ID
    private String stadiumName; // STADIUM_NAME
    private String teamName1; // TEAM_NAME1
    private String teamName2; // TEAM_NAME2
    private String stadiumAddr1; // STADIUM_ADDR1
    private String stadiumAddr2; // STADIUM_ADDR2
    private Double stadiumMapX; // STADIUM_MAPX (경도)
    private Double stadiumMapY; // STADIUM_MAPY (위도)
    private String stadiumContent; // STADIUM_CONTENT (CLOB)

    // !!! 새로 추가된 필드: 경기장 이미지 경로 !!!
    private String stadiumImagePath; // STADIUM_IMAGE_PATH
}
