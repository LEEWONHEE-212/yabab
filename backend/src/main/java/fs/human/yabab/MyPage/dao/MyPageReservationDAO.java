package fs.human.yabab.MyPage.dao;

import fs.human.yabab.MyPage.vo.MyPageReservationDTO;
import fs.human.yabab.MyPage.vo.MyPageReviewDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;


@Mapper
public interface MyPageReservationDAO {
    /**
     * 특정 사용자의 예약 내역 리스트를 조회합니다.
     * 예약된 식당 이름과 메뉴 정보까지 포함합니다.
     * @param userId 조회할 사용자 ID
     * @return 사용자의 예약 내역 리스트
     */
    List<MyPageReservationDTO> getReservationsByUserId(@Param("userId") String userId);

    /**
     * 특정 사용자의 작성 리뷰 리스트를 조회합니다.
     * 리뷰 작성자 닉네임과 식당 이름을 포함합니다.
     * @param userId 조회할 사용자 ID
     * @return 사용자의 작성 리뷰 리스트
     */
    List<MyPageReviewDTO> getReviewsByUserId(@Param("userId") String userId);

    /**
     * 특정 예약 내역을 삭제합니다.
     * @param reservationId 삭제할 예약 ID
     * @param userId        예약 소유자 ID (보안을 위해 확인)
     * @return 삭제된 레코드 수
     */
    int deleteReservation(@Param("reservationId") Long reservationId, @Param("userId") String userId);

    /**
     * 특정 리뷰를 삭제합니다.
     * @param reviewId 삭제할 리뷰 ID
     * @param userId   리뷰 작성자 ID (보안을 위해 확인)
     * @return 삭제된 레코드 수
     */
    int deleteReview(@Param("reviewId") Long reviewId, @Param("userId") String userId);
}
