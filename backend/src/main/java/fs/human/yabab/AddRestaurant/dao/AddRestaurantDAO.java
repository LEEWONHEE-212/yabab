package fs.human.yabab.AddRestaurant.dao;

import fs.human.yabab.AddRestaurant.vo.RestaurantRegisterRequest;
import fs.human.yabab.AddRestaurant.vo.StadiumDTO;
import fs.human.yabab.AddRestaurant.vo.ZoneDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AddRestaurantDAO {
    List<StadiumDTO> selectAllStadiumNamesAndIds();
    List<ZoneDTO> getZonesByStadiumId(@Param("stadiumId") Long stadiumId);
    int insertRestaurant(RestaurantRegisterRequest request);
}
