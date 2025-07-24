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

    // 필요하다면, 예약 메뉴 상세 정보를 조회하는 별도의 메서드도 추가할 수 있습니다.
    // List<MyPageReservationMenuDTO> getReservationMenusByResvId(@Param("resvId"
}
