package fs.human.yabab.Stadium.dao;

import fs.human.yabab.Stadium.vo.KakaoMapDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface KakaoMapDAO {
    KakaoMapDTO findStadiumById(@Param("stadiumId") Long stadiumId);
}
