package fs.human.yabab.Owner.controller;

import fs.human.yabab.Owner.service.OwnerReservationService;
import fs.human.yabab.Owner.vo.OwnerReservationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/owner/reservations")
@CrossOrigin(origins = "http://192.168.0.47:3000")
public class OwnerReservationController {
    @Autowired
    private OwnerReservationService ownerReservationService;

    /**
     * 특정 식당의 모든 예약 목록을 조회합니다.
     * GET /owner/reservations/list/{restaurantId}
     *
     * @param restaurantId 조회할 식당의 ID (URL 경로 변수)
     * @return 예약 목록 데이터 (JSON 형식) 및 HTTP 상태 코드
     */
    @GetMapping("/list/{restaurantId}")
    public ResponseEntity<List<OwnerReservationDTO>> getReservationsByRestaurantId(@PathVariable Long restaurantId) {
        if (restaurantId == null) {
            // restaurantId가 제공되지 않았을 경우 Bad Request (400) 반환
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        List<OwnerReservationDTO> reservations = ownerReservationService.getReservationsWithDetailsByRestaurantId(restaurantId);

        if (reservations.isEmpty()) {
            // 예약이 없을 경우 No Content (204) 또는 OK (200)에 빈 리스트 반환
            return new ResponseEntity<>(reservations, HttpStatus.OK); // 빈 리스트여도 200 OK가 일반적입니다.
        }
        return new ResponseEntity<>(reservations, HttpStatus.OK);
    }

    /**
     * 특정 예약의 상태를 변경합니다.
     * PUT /owner/reservations/status
     *
     * 요청 본문 예시:
     * {
     * "resvId": 123,
     * "newStatus": 1,
     * "updaterId": "owner123" // 이 필드는 현재 DAO/XML에서 직접 사용되지 않을 수 있으나, 요청 데이터로 받을 수 있습니다.
     * }
     *
     * @param payload 변경할 예약 ID, 새로운 상태, 업데이트한 사용자 ID를 포함하는 JSON 요청 본문
     * @return 성공/실패 메시지 및 HTTP 상태 코드
     */
    @PutMapping("/status")
    public ResponseEntity<String> updateReservationStatus(@RequestBody Map<String, Object> payload) {
        Long resvId = ((Number) payload.get("resvId")).longValue();
        Integer newStatus = (Integer) payload.get("newStatus");
        String updaterId = (String) payload.get("updaterId"); // 요청에서 updaterId를 받습니다.

        if (resvId == null || newStatus == null) {
            return new ResponseEntity<>("Required parameters (resvId, newStatus) are missing.", HttpStatus.BAD_REQUEST);
        }

        // 서비스 계층 호출하여 예약 상태 변경
        // updaterId는 현재 DAO에서 사용되지 않으므로, 이 파라미터를 사용하려면 DAO/XML 수정이 필요합니다.
        // 여기서는 서비스 메서드에 맞춰 updaterId를 전달합니다.
        boolean isUpdated = ownerReservationService.updateReservationStatus(resvId, newStatus, updaterId);

        if (isUpdated) {
            return new ResponseEntity<>("Reservation status updated successfully.", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Failed to update reservation status or reservation not found.", HttpStatus.NOT_FOUND); // 404 Not Found 또는 500 Internal Server Error
        }
    }
}
