package fs.human.yabab.Reserve.service;

import fs.human.yabab.Reserve.dao.ReservationDAO;
import fs.human.yabab.Reserve.dao.ReservationMenuDAO; // ReservationMenuDAO를 import
import fs.human.yabab.Reserve.vo.ReservationDTO;
import fs.human.yabab.Reserve.vo.ReservationMenuDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors; // 이 import는 현재 코드에서 사용되지 않지만, 다른 메서드에서 사용될 수 있으므로 유지 가능

@Service
public class ReservationService {

    private final ReservationDAO reservationDAO;
    private final ReservationMenuDAO reservationMenuDAO; // ReservationMenuDAO 주입

    @Autowired
    public ReservationService(ReservationDAO reservationDAO,
                              ReservationMenuDAO reservationMenuDAO) { // 생성자 주입
        this.reservationDAO = reservationDAO;
        this.reservationMenuDAO = reservationMenuDAO;
    }

    /**
     * 새로운 예약을 생성합니다.
     * 클라이언트로부터 받은 ReservationDTO 객체에 예약 정보와 선택된 메뉴 목록이 모두 포함되어 있다고 가정합니다.
     * 트랜잭션을 통해 예약 정보와 예약 메뉴 정보의 삽입을 원자적으로 처리합니다.
     *
     * @param reservationDTO 클라이언트로부터 받은 ReservationDTO 객체 (예약 정보와 메뉴 목록 포함)
     * @return 생성된 ReservationDTO 객체 (resvId가 채워진 상태)
     */
    @Transactional
    public ReservationDTO createReservation(ReservationDTO reservationDTO) {
        // 1. 기본값 설정 (null 허용하지 않는 필드나 서버에서 설정할 값)
        if (reservationDTO.getCreatedDate() == null) {
            reservationDTO.setCreatedDate(new Date());
        }
        if (reservationDTO.getResvStatus() == null) {
            reservationDTO.setResvStatus(0); // 기본 예약 상태: 0 (예약 대기)
        }
        // resvDate, resvTime, resvPersonCount는 DTO에서 null 허용하므로 여기서 강제 설정하지 않음

        // 2. TB_RESERVATION 테이블에 예약 정보 삽입
        reservationDAO.insertReservation(reservationDTO);

        // insertReservation 호출 후, reservationDTO.getResvId() 에는 새로 생성된 예약 ID가 들어있습니다.
        // 이 ID를 사용하여 TB_RESERVATION_MENU에 메뉴 정보 삽입

        List<ReservationMenuDTO> selectedMenus = reservationDTO.getSelectedMenus();
        if (selectedMenus != null && !selectedMenus.isEmpty()) {
            for (ReservationMenuDTO menu : selectedMenus) {
                menu.setResvId(reservationDTO.getResvId()); // 새로 생성된 예약 ID를 각 메뉴 항목에 설정

                // **** 수정된 부분: reservationDAO -> reservationMenuDAO ****
                reservationMenuDAO.insertReservationMenu(menu); // 각 메뉴 항목을 DB에 삽입
            }
        }

        return reservationDTO; // 생성된 resvId가 포함된 DTO 반환
    }

    /**
     * 특정 예약 ID로 예약 상세 정보를 조회합니다.
     * 연관된 예약 메뉴 정보도 함께 조회하여 ReservationDTO에 포함시킵니다.
     *
     * @param resvId 조회할 예약의 고유 ID
     * @return 조회된 ReservationDTO 객체, 없으면 null
     */
    @Transactional(readOnly = true)
    public ReservationDTO getReservationDetails(Long resvId) {
        ReservationDTO reservation = reservationDAO.selectReservationById(resvId);
        if (reservation != null) {
            List<ReservationMenuDTO> menus = reservationMenuDAO.selectReservationMenusByResvId(resvId);
            reservation.setSelectedMenus(menus);
        }
        return reservation;
    }

    /**
     * 특정 사용자 ID로 해당 사용자의 모든 예약 목록을 조회합니다.
     * 각 예약에 대한 메뉴 정보도 함께 로드합니다.
     *
     * @param userId 조회할 사용자의 ID
     * @return 해당 사용자의 예약 목록 (List<ReservationDTO>)
     */
    @Transactional(readOnly = true)
    public List<ReservationDTO> selectReservationsByUserId(String userId) {
        List<ReservationDTO> reservations = reservationDAO.selectReservationsByUserId(userId);
        if (reservations != null && !reservations.isEmpty()) {
            for (ReservationDTO reservation : reservations) {
                List<ReservationMenuDTO> menus = reservationMenuDAO.selectReservationMenusByResvId(reservation.getResvId());
                reservation.setSelectedMenus(menus);
            }
        }
        return reservations;
    }

    /**
     * 특정 예약의 상태를 업데이트합니다.
     *
     * @param resvId 업데이트할 예약의 ID
     * @param newStatus 변경할 새로운 예약 상태 값 (0, 1, 2)
     * @param updatedBy 상태 변경을 요청한 사용자 ID
     * @return 업데이트된 ReservationDTO 객체, 없으면 null (업데이트 실패 시)
     */
    @Transactional
    public ReservationDTO updateReservationStatus(Long resvId, Integer newStatus, String updatedBy) {
        ReservationDTO existingReservation = reservationDAO.selectReservationById(resvId);
        if (existingReservation == null) {
            return null; // 예약이 존재하지 않음
        }

        reservationDAO.updateReservationStatus(resvId, newStatus, updatedBy);

        return getReservationDetails(resvId); // 업데이트된 최신 정보 반환
    }

    /**
     * 특정 예약 정보를 삭제합니다.
     * 연관된 예약 메뉴 정보도 함께 삭제됩니다.
     *
     * @param resvId 삭제할 예약의 ID
     */
    @Transactional
    public void deleteReservation(Long resvId) {
        reservationMenuDAO.deleteReservationMenusByResvId(resvId); // 메뉴 먼저 삭제
        reservationDAO.deleteReservation(resvId); // 예약 정보 삭제
    }
}