package fs.human.yabab.PlayerRestaurantPick.service;

import fs.human.yabab.PlayerRestaurantPick.dao.PlayerPickDAO;
import fs.human.yabab.PlayerRestaurantPick.vo.PlayerPickCombinedDTO;
import fs.human.yabab.PlayerRestaurantPick.vo.TeamPickCategoryDTO;
import fs.human.yabab.PlayerRestaurantPick.vo.YoutubeChannelDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PlayerPickService {

    private final PlayerPickDAO playerPickDAO;

    @Autowired
    public PlayerPickService(PlayerPickDAO playerPickDAO) {
        this.playerPickDAO = playerPickDAO;
    }

    public List<TeamPickCategoryDTO> getAllPlayerRestaurantPicksGroupedByTeam() {
        List<PlayerPickCombinedDTO> allPicks = playerPickDAO.findAllPlayerPicksWithRestaurantInfo();
        Map<String, TeamPickCategoryDTO> teamMap = new HashMap<>();

        for (PlayerPickCombinedDTO pick : allPicks) {
            String teamId;
            String teamName;
            String youtubeChannelName;
            String youtubeChannelUrl;

            // 데이터베이스의 PICK_TEAM_NAME 컬럼 값과 정확히 일치하도록 수정
            switch (pick.getTeamName()) {
                case "한화 이글스":
                    teamId = "HanwhaEagles";
                    teamName = "한화 이글스";
                    youtubeChannelName = "한화이글스 TV";
                    youtubeChannelUrl = "https://www.youtube.com/@HanwhaEagles_official";
                    break;
                case "KT 위즈":
                    teamId = "KtWiz";
                    teamName = "KT 위즈";
                    youtubeChannelName = "KT 위즈 TV";
                    youtubeChannelUrl = "https://www.youtube.com/@ktwiztv";
                    break;
                case "두산 베어스":
                    teamId = "DoosanBears";
                    teamName = "두산 베어스";
                    youtubeChannelName = "두산베어스 TV";
                    youtubeChannelUrl = "https://www.youtube.com/@doosanbears_official";
                    break;
                case "LG 트윈스":
                    teamId = "LGTwins";
                    teamName = "LG 트윈스";
                    youtubeChannelName = "LGTwins TV";
                    youtubeChannelUrl = "https://www.youtube.com/@LGTwinsTV";
                    break;
                case "SSG 랜더스":
                    teamId = "SSGlanders";
                    teamName = "SSG 랜더스";
                    youtubeChannelName = "SSG LANDERS";
                    youtubeChannelUrl = "https://www.youtube.com/@SSGLANDERS";
                    break;
                case "NC 다이노스":
                    teamId = "NCDinos";
                    teamName = "NC 다이노스";
                    youtubeChannelName = "NC 다이노스";
                    youtubeChannelUrl = "https://www.youtube.com/@NCDINOS";
                    break;
                // --- 이 부분만 수정하면 됩니다. 'KIA'를 '기아'로 변경했습니다. ---
                case "기아 타이거즈": // 데이터베이스의 실제 값인 '기아 타이거즈'로 변경
                    teamId = "KiaTigers"; // ID는 영문 소문자로 일관성 있게 맞췄습니다.
                    teamName = "기아 타이거즈"; // 데이터베이스의 실제 값으로 변경
                    youtubeChannelName = "KIA TIGERS TV"; // 실제 채널 이름으로 유지
                    youtubeChannelUrl = "https://www.youtube.com/@KIATIGERSTV"; // 실제 채널 URL로 유지
                    break;
                // --- 수정 끝 ---
                case "롯데 자이언츠":
                    teamId = "LotteGiants";
                    teamName = "롯데 자이언츠";
                    youtubeChannelName = "롯데자이언츠 TV";
                    youtubeChannelUrl = "https://www.youtube.com/@LotteGiantsTV";
                    break;
                case "삼성 라이온즈":
                    teamId = "SamsungLions";
                    teamName = "삼성 라이온즈";
                    youtubeChannelName = "삼성 라이온즈 TV";
                    youtubeChannelUrl = "https://www.youtube.com/@samsunglionstv";
                    break;
                case "키움 히어로즈":
                    teamId = "KiwoomHeroes";
                    teamName = "키움 히어로즈";
                    youtubeChannelName = "키움히어로즈";
                    youtubeChannelUrl = "https://www.youtube.com/@heroesbaseballclub";
                    break;
                default:
                    teamId = "UnknownTeam";
                    teamName = "알 수 없는 팀";
                    youtubeChannelName = "알 수 없는 채널";
                    youtubeChannelUrl = pick.getSourceUrl() != null ? pick.getSourceUrl() : "https://www.youtube.com/";
                    break;
            }

            if (!teamMap.containsKey(teamId)) {
                YoutubeChannelDTO youtubeInfo = new YoutubeChannelDTO(youtubeChannelName, youtubeChannelUrl);
                teamMap.put(teamId, new TeamPickCategoryDTO(teamId, teamName, youtubeInfo, new ArrayList<>()));
            }
            teamMap.get(teamId).getRestaurants().add(pick);
        }

        return new ArrayList<>(teamMap.values());
    }
}