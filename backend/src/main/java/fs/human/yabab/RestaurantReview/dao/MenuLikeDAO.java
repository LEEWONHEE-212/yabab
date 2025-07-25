package fs.human.yabab.RestaurantReview.dao;

import fs.human.yabab.RestaurantReview.vo.MenuLikeRequestDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MenuLikeDAO {
    /**
     * 특정 메뉴에 대한 좋아요 수를 조회합니다.
     * @param menuId 메뉴의 고유 ID
     * @return 해당 메뉴의 좋아요 수
     */
    int getMenuLikeCount(@Param("menuId") Long menuId);

    /**
     * 사용자가 특정 메뉴에 좋아요를 눌렀는지 여부를 확인합니다.
     * @param menuId 메뉴의 고유 ID
     * @param userId 사용자의 고유 ID
     * @return 좋아요를 눌렀으면 1, 누르지 않았으면 0
     */
    int isMenuLikedByUser(@Param("menuId") Long menuId, @Param("userId") String userId);

    /**
     * 메뉴에 좋아요를 추가합니다.
     * @param menuLikeDto 좋아요 정보를 담은 DTO (menuId, userId 포함)
     * @return 삽입된 행의 수 (보통 1)
     */
    int insertMenuLike(MenuLikeRequestDTO menuLikeDto);

    /**
     * 메뉴의 좋아요를 취소합니다 (삭제).
     * @param menuLikeDto 좋아요 정보를 담은 DTO (menuId, userId 포함)
     * @return 삭제된 행의 수 (보통 1)
     */
    int deleteMenuLike(MenuLikeRequestDTO menuLikeDto);

    // 추가적으로, 좋아요 랭킹 시스템을 위한 메서드를 여기에 추가할 수 있습니다.
    // 예: List<MenuRankingDto> getTopLikedMenus(@Param("limit") int limit);
}