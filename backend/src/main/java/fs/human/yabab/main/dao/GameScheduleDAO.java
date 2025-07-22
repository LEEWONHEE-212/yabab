package fs.human.yabab.main.dao;

import fs.human.yabab.main.vo.GameScheduleVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface GameScheduleDAO {
    List<GameScheduleVO> selectGameScheduleByDate(String date);
}
