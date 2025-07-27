package fs.human.yabab.Owner.dao;

import fs.human.yabab.Owner.vo.OwnerReservationDTO;
import fs.human.yabab.Owner.vo.OwnerReservationMenuDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OwnerReservationDAO {
    /**
     * 특정 식당의 모든 예약 목록을 조회합니다.
     * 각 예약에 포함된 메뉴 정보도 함께 조회됩니다.
     * @param restaurantId 식당 ID
     * @return 예약 정보와 그에 따른 메뉴 정보가 포함된 OwnerReservationDTO 리스트
     */
    List<OwnerReservationDTO> selectAllReservationsByRestaurantId(@Param("restaurantId") Long restaurantId);

    /**
     * 특정 예약의 상태를 변경합니다.
     * @param resvId 예약 ID
     * @param newStatus 변경할 예약 상태 코드 (0: 대기, 1: 완료, 2: 취소 등)
     * @param restaurantId 예약을 업데이트하는 식당의 ID (UPDATED_BY 필드에 사용)
     * @return 업데이트된 레코드 수
     */
    int updateReservationStatus(@Param("resvId") Long resvId,
                                @Param("newStatus") Integer newStatus,
                                @Param("restaurantId") Long restaurantId); // <-- 이 부분을 추가했습니다.

    /**
     * (선택 사항) 특정 예약에 대한 모든 메뉴 상세 정보를 조회합니다.
     * selectAllReservationsByRestaurantId 쿼리에서 조인으로 가져올 경우 별도 필요 없을 수 있음.
     * @param resvId 예약 ID
     * @return 해당 예약의 메뉴 상세 정보 리스트
     */
    List<OwnerReservationMenuDTO> selectReservationMenusByResvId(@Param("resvId") Long resvId);
}