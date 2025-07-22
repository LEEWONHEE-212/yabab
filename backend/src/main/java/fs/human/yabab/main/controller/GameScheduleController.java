package fs.human.yabab.main.controller;

import fs.human.yabab.main.service.GameScheduleService;
import fs.human.yabab.main.vo.GameScheduleVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "http://localhost:3000")
public class GameScheduleController {

    @Autowired
    private GameScheduleService gameScheduleService;

    @GetMapping
    public List<GameScheduleVO> getGameScheduleByDate(@RequestParam String date) {
        return gameScheduleService.getGameSchedule(date);
    }

}
