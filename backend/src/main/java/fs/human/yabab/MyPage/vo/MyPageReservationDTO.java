package fs.human.yabab.MyPage.vo;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MyPageReservationDTO {
    private Long reservationId; // RESV_ID (NUMBER -> Long)
    private String restaurantName; // TB_RESTAURANT 테이블에서 가져올 이름
    private LocalDate reservationDate; // RESV_DATE (DATE -> LocalDate)
    private LocalTime reservationTime; // RESV_TIME (VARCHAR2(5 BYTE) -> LocalTime)
    private Integer personCount; // RESV_PERSON_COUNT (NUMBER -> Integer)
    private String reservationRequest; // RESV_REQUEST (VARCHAR2 -> String)
    private String status; // RESV_STATUS (NUMBER -> String 변환: 0=대기, 1=확정, 2=취소)
    private List<MyPageReservationMenuDTO> menuItems; // TB_RESERVATION_MENU와 조인하여 메뉴 리스트
}
