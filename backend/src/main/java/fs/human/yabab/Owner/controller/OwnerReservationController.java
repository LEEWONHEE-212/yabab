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
@CrossOrigin(origins = "http://localhost:3000")
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
            // 빈 리스트여도 200 OK가 일반적입니다.
            return new ResponseEntity<>(reservations, HttpStatus.OK);
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
     * "restaurantId": 456 // UPDATED_BY 필드에 사용될 식당 ID (Long 타입)
     * }
     *
     * @param payload 변경할 예약 ID, 새로운 상태, 업데이트한 식당 ID를 포함하는 JSON 요청 본문
     * @return 성공/실패 메시지 및 HTTP 상태 코드
     */
    @PutMapping("/status")
    public ResponseEntity<String> updateReservationStatus(@RequestBody Map<String, Object> payload) {
        // payload에서 각 값을 추출합니다. Map의 get() 메서드는 Object를 반환하므로 적절한 타입 캐스팅이 필요합니다.
        // 숫자 타입은 Number로 받은 후 LongValue()를 사용하여 Long으로 변환하는 것이 안전합니다.

        // NullPointerException 방지를 위해 Map.get() 결과가 null인지 먼저 확인합니다.
        Object resvIdObj = payload.get("resvId");
        Long resvId = null;
        if (resvIdObj instanceof Number) {
            resvId = ((Number) resvIdObj).longValue();
        }

        Object newStatusObj = payload.get("newStatus");
        Integer newStatus = null;
        if (newStatusObj instanceof Integer) {
            newStatus = (Integer) newStatusObj;
        } else if (newStatusObj instanceof Number) { // Integer가 아닐 수도 있으니 Number로도 받아서 처리
            newStatus = ((Number) newStatusObj).intValue();
        }

        Object restaurantIdObj = payload.get("restaurantId");
        Long restaurantId = null;
        if (restaurantIdObj instanceof Number) {
            restaurantId = ((Number) restaurantIdObj).longValue();
        }

        // 모든 필수 파라미터가 유효한지 최종적으로 검증합니다.
        if (resvId == null || newStatus == null || restaurantId == null) {
            return new ResponseEntity<>("Required parameters (resvId, newStatus, restaurantId) are missing or invalid type.", HttpStatus.BAD_REQUEST);
        }

        // 서비스 계층 호출하여 예약 상태 변경
        boolean isUpdated = ownerReservationService.updateReservationStatus(resvId, newStatus, restaurantId);

        if (isUpdated) {
            return new ResponseEntity<>("Reservation status updated successfully.", HttpStatus.OK);
        } else {
            // 업데이트 실패의 경우, 예약 ID가 없거나 다른 문제일 수 있습니다.
            return new ResponseEntity<>("Failed to update reservation status or reservation not found.", HttpStatus.NOT_FOUND);
        }
    }
}