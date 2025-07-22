package fs.human.yabab.main.service;

import fs.human.yabab.main.dao.GameScheduleDAO;
import fs.human.yabab.main.vo.GameScheduleVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameScheduleService {

    @Autowired
    private GameScheduleDAO gameScheduleDAO;

    public List<GameScheduleVO> getGameSchedule(String date) {
        return gameScheduleDAO.selectGameScheduleByDate(date);
    }
}
