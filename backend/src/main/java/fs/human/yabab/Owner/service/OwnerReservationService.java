package fs.human.yabab.Owner.service;

import fs.human.yabab.Owner.dao.OwnerReservationDAO;
import fs.human.yabab.Owner.vo.OwnerReservationDTO;
import fs.human.yabab.Owner.vo.OwnerReservationMenuDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OwnerReservationService {

    @Autowired
    private OwnerReservationDAO ownerReservationDAO;

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
     * @param resvId       예약 ID
     * @param newStatus    변경할 예약 상태 코드 (0: 대기, 1: 완료, 2: 취소 등)
     * @param restaurantId 상태를 변경한 식당의 ID (UPDATED_BY 컬럼 조회에 사용)
     * @return 상태 변경 성공 여부 (true: 성공, false: 실패)
     */
    @Transactional
    public boolean updateReservationStatus(Long resvId, Integer newStatus, Long restaurantId) {
        // DAO의 updateReservationStatus 메서드가 이제 restaurantId를 받으므로, 함께 전달합니다.
        int updatedRows = ownerReservationDAO.updateReservationStatus(resvId, newStatus, restaurantId);
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