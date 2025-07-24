package fs.human.yabab.Owner.service; // 패키지 경로에 주의: Owner 대문자

import fs.human.yabab.Owner.dao.OwnerReservationDAO; // DAO 경로에 주의: Owner 대문자
import fs.human.yabab.Owner.vo.OwnerReservationDTO; // DTO 경로에 주의: Owner 대문자
import fs.human.yabab.Owner.vo.OwnerReservationMenuDTO; // DTO 경로에 주의: Owner 대문자
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OwnerReservationService { // 클래스명도 OwnerReservationService로 변경하여 일관성 유지

    @Autowired
    private OwnerReservationDAO ownerReservationDAO; // DAO 이름에 맞춰 필드명 변경

    /**
     * 특정 식당의 모든 예약 목록을 조회하고, 각 예약에 대한 메뉴 상세 정보와 총 가격을 계산하여 반환합니다.
     *
     * @param restaurantId 조회할 식당의 ID
     * @return 메뉴 상세 정보 및 계산된 총 가격이 포함된 OwnerReservationDTO 리스트
     */
    public List<OwnerReservationDTO> getReservationsWithDetailsByRestaurantId(Long restaurantId) {
        // 1. 기본 예약 정보 리스트를 조회합니다.
        List<OwnerReservationDTO> reservations = ownerReservationDAO.selectAllReservationsByRestaurantId(restaurantId);

        // 2. 각 예약에 대해 메뉴 상세 정보를 조회하고 총 가격 등을 계산하여 DTO에 채워 넣습니다.
        for (OwnerReservationDTO reservation : reservations) {
            // 해당 예약에 연결된 모든 메뉴 항목을 조회합니다. (메뉴 이름, 가격 포함)
            List<OwnerReservationMenuDTO> reservationMenus = ownerReservationDAO.selectReservationMenusByResvId(reservation.getResvId());

            int totalQuantity = 0;
            long totalPrice = 0L; // 총 결제 금액

            // 각 예약 메뉴 항목에 대해 수량과 금액을 합산합니다.
            for (OwnerReservationMenuDTO resvMenu : reservationMenus) {
                // OwnerReservationMenuDTO에 이미 menuPrice가 있으므로 바로 사용합니다.
                totalQuantity += resvMenu.getQuantity(); // 총 주문 개수 합산
                totalPrice += (long) resvMenu.getMenuPrice() * resvMenu.getQuantity(); // 총 결제 금액 합산
            }

            // 계산된 총 개수, 총 가격, 메뉴 요약, 그리고 상세 메뉴 리스트를 OwnerReservationDTO에 설정합니다.
            reservation.setTotalOrderQuantity(totalQuantity);
            reservation.setTotalPaymentAmount(totalPrice);
            reservation.setMenuSummary(createMenuSummary(reservationMenus)); // 메뉴 요약
            reservation.setReservationMenus(reservationMenus); // 주문 메뉴 상세 리스트 설정
        }
        return reservations;
    }


    /**
     * 특정 예약의 상태를 변경합니다.
     * 이 메서드는 트랜잭션으로 묶여 있어, 작업 중 오류 발생 시 롤백됩니다.
     *
     * @param resvId      예약 ID
     * @param newStatus   변경할 예약 상태 코드 (0: 대기, 1: 완료, 2: 취소 등)
     * @param updaterId   상태를 변경한 사용자(사장님)의 ID (UPDATED_BY 컬럼에 기록될 값) - 현재 DAO에는 이 파라미터가 없음.
     * DAO의 updateReservationStatus 메서드를 수정하거나, 해당 값을 DB에서 가져오는 방식으로 변경해야 함.
     * @return 상태 변경 성공 여부 (true: 성공, false: 실패)
     */
    @Transactional
    public boolean updateReservationStatus(Long resvId, Integer newStatus, String updaterId) {
        // 현재 DAO의 updateReservationStatus 메서드는 updaterId를 직접 받지 않습니다.
        // XML 매퍼에서 UPDATED_BY를 (SELECT USER_ID FROM TB_RESTAURANT WHERE RESTAURANT_ID = #{restaurantId}) 로 설정했으므로
        // 이 메서드에서는 restaurantId를 추가 파라미터로 받거나, DAO 메서드를 수정해야 합니다.
        // 현재 DAO와 XML에 맞춰 파라미터는 resvId와 newStatus만 사용합니다.
        // TODO: UPDATED_BY를 updaterId로 설정하려면 DAO와 XML 매퍼의 updateReservationStatus 메서드를 수정해야 합니다.
        int updatedRows = ownerReservationDAO.updateReservationStatus(resvId, newStatus);
        return updatedRows > 0;
    }

    /**
     * 예약된 메뉴 목록을 기반으로 요약 문자열을 생성합니다.
     * 예: "아메리카노 외 2개"
     * @param reservationMenus 해당 예약의 메뉴 항목 리스트 (메뉴 이름 포함)
     * @return 메뉴 요약 문자열
     */
    private String createMenuSummary(List<OwnerReservationMenuDTO> reservationMenus) {
        if (reservationMenus == null || reservationMenus.isEmpty()) {
            return "메뉴 없음";
        }

        if (reservationMenus.size() == 1) {
            return reservationMenus.get(0).getMenuName(); // 단일 메뉴의 이름 반환
        } else {
            String firstMenuName = reservationMenus.get(0).getMenuName();
            return firstMenuName + " 외 " + (reservationMenus.size() - 1) + "개";
        }
    }
}