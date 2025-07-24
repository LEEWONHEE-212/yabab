package fs.human.yabab.Reserve.controller;

import fs.human.yabab.Reserve.service.ReservationService;
import fs.human.yabab.Reserve.vo.ReservationDTO; // ReservationDTO만 사용
import fs.human.yabab.Reserve.vo.ReservationMenuDTO; // 이전에 ReservationMenuDTO도 사용되었으므로 명시적으로 임포트

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Lombok 어노테이션 임포트 (내부 클래스 ReservationStatusUpdateRequest를 위해 필요)
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "http://localhost:3000")
public class ReservationController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * 새로운 예약을 생성합니다.
     * 클라이언트가 /api/reservations/{restaurantId} 형태로 POST 요청을 보내는 경우에 대응하도록 수정합니다.
     *
     * @param restaurantId URL 경로에서 받은 식당 ID (클라이언트 요청에 맞춰 추가)
     * @param reservationDTO 클라이언트로부터 받은 ReservationDTO 객체 (JSON 형태)
     * 이 객체는 userId, resvDate, resvTime, resvPersonCount, resvRequest
     * 및 List<ReservationMenuDTO> reservationMenus 필드를 포함해야 합니다.
     * (restaurantId는 URL 경로에서 받아 DTO에 주입합니다.)
     * @return 생성된 ReservationDTO 객체를 포함한 ResponseEntity (201 Created) 또는 오류 응답
     */
    @PostMapping("/{restaurantId}") // <-- **여기를 수정!** PathVariable을 받도록 변경
    public ResponseEntity<ReservationDTO> createReservation(
            @PathVariable("restaurantId") Long restaurantId, // <-- **여기를 추가!** restaurantId 파라미터 추가
            @RequestBody ReservationDTO reservationDTO) {
        try {
            // URL 경로에서 받은 restaurantId를 reservationDTO에 설정
            // 클라이언트 페이로드에는 restaurantId가 없으므로 이 작업이 필수적입니다.
            reservationDTO.setRestaurantId(restaurantId); // <-- **여기를 추가!** DTO에 restaurantId 설정

            ReservationDTO newReservation = reservationService.createReservation(reservationDTO);
            return new ResponseEntity<>(newReservation, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.err.println("예약 생성 실패 (유효성): " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("예약 생성 중 서버 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 예약 ID로 예약 상세 정보를 조회합니다.
     * Service의 getReservationDetails(Long) 메서드 시그니처에 정확히 맞춥니다.
     *
     * @param resvId 조회하려는 예약의 고유 ID (URL 경로 변수)
     * @return 조회된 ReservationDTO 객체를 포함한 ResponseEntity (200 OK) 또는 404 Not Found
     */
    @GetMapping("/{resvId}")
    public ResponseEntity<ReservationDTO> getReservationDetails(@PathVariable("resvId") Long resvId) {
        try {
            ReservationDTO reservation = reservationService.getReservationDetails(resvId);
            if (reservation != null) {
                return new ResponseEntity<>(reservation, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("예약 상세 조회 중 서버 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 사용자 ID로 해당 사용자의 모든 예약 목록을 조회합니다.
     * Service의 selectReservationsByUserId(String) 메서드 시그니처에 정확히 맞춥니다.
     *
     * @param userId 조회하려는 사용자의 ID (URL 경로 변수)
     * @return 조회된 ReservationDTO 목록을 포함한 ResponseEntity (200 OK), 예약이 없으면 빈 리스트 반환
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationDTO>> getUserReservations(@PathVariable("userId") String userId) {
        try {
            List<ReservationDTO> reservations = reservationService.selectReservationsByUserId(userId);
            return new ResponseEntity<>(reservations, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("사용자 예약 목록 조회 중 서버 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 예약의 상태를 업데이트합니다.
     * Service의 updateReservationStatus(Long, Integer, String) 메서드 시그니처에 정확히 맞춥니다.
     * HTTP PATCH 요청을 통해 예약 ID와 새로운 상태 값을 받아 처리합니다.
     *
     * @param resvId 업데이트할 예약의 ID (URL 경로 변수)
     * @param statusUpdateRequest 새로운 상태 값을 담은 요청 DTO (JSON 형태)
     * @return 업데이트된 ReservationDTO 객체를 포함한 ResponseEntity (200 OK) 또는 오류 응답
     */
    @PatchMapping("/{resvId}/status")
    public ResponseEntity<ReservationDTO> updateReservationStatus(
            @PathVariable("resvId") Long resvId,
            @RequestBody ReservationStatusUpdateRequest statusUpdateRequest) {
        try {
            String updatedBy = "system_updater"; // TODO: 실제 사용자 ID로 변경 필요

            ReservationDTO updatedReservation = reservationService.updateReservationStatus(
                    resvId, statusUpdateRequest.getResvStatus(), updatedBy); // Service 시그니처에 맞춤

            if (updatedReservation != null) {
                return new ResponseEntity<>(updatedReservation, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("예약 상태 업데이트 중 서버 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 예약을 삭제합니다.
     * Service의 deleteReservation(Long) 메서드 시그니처에 정확히 맞춥니다.
     *
     * @param resvId 삭제할 예약의 ID (URL 경로 변수)
     * @return 삭제 성공 시 204 No Content, 실패 시 오류 응답
     */
    @DeleteMapping("/{resvId}")
    public ResponseEntity<Void> deleteReservation(@PathVariable("resvId") Long resvId) {
        try {
            reservationService.deleteReservation(resvId); // Service 시그니처에 맞춤
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            System.err.println("예약 삭제 중 서버 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 예약 상태 업데이트 요청을 위한 DTO (컨트롤러 내부에 정의)
    // 이 DTO는 Service 계층에서 직접 사용되지 않고, Controller에서 요청 본문을 파싱하기 위한 용도입니다.
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class ReservationStatusUpdateRequest {
        private Integer resvStatus;
    }
}