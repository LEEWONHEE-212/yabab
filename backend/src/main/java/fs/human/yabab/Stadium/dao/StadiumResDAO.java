package fs.human.yabab.Stadium.dao;

import fs.human.yabab.Stadium.vo.StadiumResDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StadiumResDAO {
    List<StadiumResDTO> selectRestaurantsByStadiumAndFlag(
            @Param("stadiumId") Long stadiumId,
            @Param("restaurantInsideFlag") Integer restaurantInsideFlag,
            @Param("infieldOutfield") List<String> infieldOutfield, // 추가된 필터
            @Param("base") List<String> base,                       // 추가된 필터
            @Param("floor") List<String> floor,                     // 추가된 필터
            @Param("sortBy") String sortBy,
            @Param("offset") int offset,
            @Param("limit") int limit
    );

    int countRestaurantsByStadiumAndFlag(
            @Param("stadiumId") Long stadiumId,
            @Param("restaurantInsideFlag") Integer restaurantInsideFlag,
            @Param("infieldOutfield") List<String> infieldOutfield, // 추가된 필터
            @Param("base") List<String> base,                       // 추가된 필터
            @Param("floor") List<String> floor                     // 추가된 필터
    );

    StadiumResDTO selectRestaurantDetailById(@Param("id") Long id);
}
