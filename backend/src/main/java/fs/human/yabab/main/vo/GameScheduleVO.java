package fs.human.yabab.main.vo;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class GameScheduleVO {
    private int gameId;
    private int homeTeamId;
    private int awayTeamId;
    private int stadiumId;
    private String startTime;
    private Date gameDate;

    //  조인된 이름들
    private String homeTeamName;
    private String awayTeamName;
    private String stadiumName;

    //  프론트 표시용 별칭
    private String stadiumAlias;


}
