package fs.human.yabab.PlayerRestaurantPick.controller;

import fs.human.yabab.PlayerRestaurantPick.service.PlayerPickService;
import fs.human.yabab.PlayerRestaurantPick.vo.TeamPickCategoryDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController // 이 클래스가 RESTful 웹 서비스의 컨트롤러임을 나타냅니다.
@RequestMapping("/api/player-picks") // 이 컨트롤러의 모든 핸들러 메서드에 대한 기본 URL 경로를 설정합니다.
@CrossOrigin(origins = "http://localhost:3000") // CORS(Cross-Origin Resource Sharing) 설정: 프론트엔드 도메인에서 이 API에 접근할 수 있도록 허용합니다.
public class PlayerPickController {

    private final PlayerPickService playerPickService; // Service 계층을 주입받습니다.

    @Autowired // 생성자 주입 방식으로 Service를 주입받습니다.
    public PlayerPickController(PlayerPickService playerPickService) {
        this.playerPickService = playerPickService;
    }

    /**
     * 모든 선수 추천 맛집 정보를 팀별로 그룹화하여 반환하는 API 엔드포인트입니다.
     * GET 요청 시 호출됩니다.
     *
     * @return 팀별로 그룹화된 선수 추천 맛집 정보 리스트 (JSON 형식)
     */
    @GetMapping // HTTP GET 요청을 처리하는 메서드임을 나타냅니다.
    public ResponseEntity<List<TeamPickCategoryDTO>> getAllPlayerPicks() {
        try {
            // Service 계층의 메서드를 호출하여 데이터베이스에서 가공된 데이터를 가져옵니다.
            List<TeamPickCategoryDTO> playerPicks = playerPickService.getAllPlayerRestaurantPicksGroupedByTeam();

            // 데이터가 없을 경우 204 No Content 응답을 반환합니다.
            if (playerPicks.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            // 데이터가 있을 경우 200 OK 응답과 함께 데이터를 반환합니다.
            return new ResponseEntity<>(playerPicks, HttpStatus.OK);
        } catch (Exception e) {
            // 예외 발생 시 서버 콘솔에 에러 로그를 출력하고 500 Internal Server Error 응답을 반환합니다.
            System.err.println("Error fetching player picks: " + e.getMessage());
            e.printStackTrace(); // 디버깅을 위해 스택 트레이스도 출력합니다.
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}