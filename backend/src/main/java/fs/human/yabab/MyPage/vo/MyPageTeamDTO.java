package fs.human.yabab.MyPage.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MyPageTeamDTO {
    private Long teamId;    // DB 컬럼: team_id
    private String teamName; // DB 컬럼: team_name
}
