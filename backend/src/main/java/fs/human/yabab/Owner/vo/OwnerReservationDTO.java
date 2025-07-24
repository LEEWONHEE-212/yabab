package fs.human.yabab.Owner.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import fs.human.yabab.common.BaseVO;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OwnerReservationDTO extends BaseVO{
    private Long resvId; // RESV_ID (NUMBER)
    private Long restaurantId; // RESTAURANT_ID (NUMBER)
    private String userId; // USER_ID (VARCHAR2) - 예약한 사용자 ID
    private LocalDate resvDate; // RESV_DATE (DATE) - 예약 날짜
    private String resvTime; // RESV_TIME (VARCHAR2) - 예약 시간 (예: "19:00")
    private Integer resvPersonCount; // RESV_PERSON_COUNT (NUMBER) - 예약 인원
    private String resvRequest; // RESV_REQUEST (VARCHAR2) - 예약 요청사항
    private Integer resvStatus; // RESV_STATUS (NUMBER(1,0)) - 예약 상태 (0: 대기, 1: 완료, 2: 취소 등)

    // --- 서비스에서 채워질 추가 필드 (이전 안내에서 말씀드렸던 부분) ---
    private String menuSummary; // 예약 목록 리스트용 메뉴 요약
    private int totalOrderQuantity; // 총 주문 개수
    private long totalPaymentAmount; // 총 결제 금액
    private List<OwnerReservationMenuDTO> reservationMenus; // 예약 메뉴 상세 정보 리스트
}
