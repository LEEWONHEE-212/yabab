package fs.human.yabab.Reserve.vo; // 패키지 통일

import fs.human.yabab.Reserve.vo.ReservationMenuDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import fs.human.yabab.common.BaseVO;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO extends BaseVO {
    private Long resvId;
    private Long restaurantId;
    private String userId;
    private Date resvDate;
    private String resvTime;
    private Integer resvPersonCount;
    private String resvRequest;
    private Integer resvStatus; // 0: 예약 대기, 1: 예약 확정, 2: 예약 취소

    // ReservationMenu 리스트는 이 객체에 포함될 수 있습니다 (필요에 따라)
    private List<ReservationMenuDTO> selectedMenus;
}
