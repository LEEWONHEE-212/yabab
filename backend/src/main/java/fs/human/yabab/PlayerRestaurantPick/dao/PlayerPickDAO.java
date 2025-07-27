package fs.human.yabab.PlayerRestaurantPick.dao;

import fs.human.yabab.PlayerRestaurantPick.vo.PlayerPickCombinedDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper // 이 어노테이션은 Spring이 이 인터페이스를 MyBatis 매퍼로 인식하게 합니다.
public interface PlayerPickDAO {

    /**
     * TB_PLAYER_PICK과 TB_RESTAURANT 테이블을 조인하여
     * 선수 추천 맛집 정보를 PlayerPickCombinedDTO 리스트 형태로 반환합니다.
     *
     * @return 조인된 선수 추천 맛집 정보 리스트
     */
    List<PlayerPickCombinedDTO> findAllPlayerPicksWithRestaurantInfo();
}
