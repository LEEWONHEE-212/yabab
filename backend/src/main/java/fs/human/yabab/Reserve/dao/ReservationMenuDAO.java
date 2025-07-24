package fs.human.yabab.Reserve.dao; // 패키지명 변경

import fs.human.yabab.Reserve.vo.ReservationMenuDTO; // VO/DTO 임포트
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * TB_RESERVATION_MENU 테이블과 상호작용하는 DAO (Mapper) 인터페이스.
 * SQL 쿼리는 ReservationMenuMapper.xml에 정의됩니다.
 */
@Mapper // 이 인터페이스가 MyBatis Mapper임을 Spring에 알려줍니다.
public interface ReservationMenuDAO { // 인터페이스명 변경

    void insertReservationMenu(ReservationMenuDTO reservationMenu); // DTO 객체로 변경

    void insertReservationMenus(@Param("list") List<ReservationMenuDTO> reservationMenus); // DTO 객체로 변경

    List<ReservationMenuDTO> selectReservationMenusByResvId(Long resvId); // DTO 객체로 변경

    void deleteReservationMenu(Long resvMenuId);

    void deleteReservationMenusByResvId(Long resvId);
}