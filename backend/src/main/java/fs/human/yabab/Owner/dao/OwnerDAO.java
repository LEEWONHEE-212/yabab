package fs.human.yabab.Owner.dao;

import fs.human.yabab.Owner.vo.Owner_MenuDTO;
import fs.human.yabab.Owner.vo.OwnerDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OwnerDAO {
    // 특정 ownerId로 레스토랑 정보 조회
    OwnerDTO findRestaurantByOwnerId(String ownerId);

    // 특정 restaurantId로 레스토랑 정보 조회
    // OwnerService에서 기존 정보를 가져오거나, 업데이트 후 최신 정보를 가져올 때 사용됩니다.
    OwnerDTO findRestaurantById(@Param("id") Long id);

    // 모든 구장 이름과 ID 조회
    List<OwnerDTO> selectAllStadiumNamesAndIds();

    // 특정 구장의 구역 조회
    List<OwnerDTO> getZonesByStadiumId(@Param("stadiumId") Long stadiumId);

    //식당 정보를 업데이트합니다.
    int updateRestaurant(OwnerDTO ownerDTO);

    //특정 식당의 모든 메뉴 항목을 조회
    List<Owner_MenuDTO> findMenusByRestaurantId(@Param("restaurantId") Long restaurantId);

    //새로운 메뉴 항목을 추가합니다.
    int insertMenu(Owner_MenuDTO ownerMenuDTO);

    //기존 메뉴 항목의 정보를 업데이트합니다.
    int updateMenu(Owner_MenuDTO ownerMenuDTO);

    //특정 메뉴 항목을 삭제합니다.
    int deleteMenu(@Param("menuId") Long menuId);

    //특정 메뉴 ID로 메뉴를 조회
    Owner_MenuDTO findMenuById(@Param("menuId") Long menuId);
}