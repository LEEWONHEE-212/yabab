package fs.human.yabab.Reserve.dao; // 패키지명 변경

import fs.human.yabab.Reserve.vo.ReservationDTO; // VO/DTO 임포트
import fs.human.yabab.Reserve.vo.ReservationMenuDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * TB_RESERVATION 테이블과 상호작용하는 DAO (Mapper) 인터페이스.
 * SQL 쿼리는 ReservationMapper.xml에 정의됩니다.
 */
@Mapper // 이 인터페이스가 MyBatis Mapper임을 Spring에 알려줍니다.
public interface ReservationDAO { // 인터페이스명 변경

    void insertReservation(ReservationDTO reservation); // DTO 객체로 변경

    ReservationDTO selectReservationById(Long resvId); // DTO 객체로 변경

    List<ReservationDTO> selectReservationsByUserId(String userId); // DTO 객체로 변경

    void updateReservation(ReservationDTO reservation); // DTO 객체로 변경

    void updateReservationStatus(@Param("resvId") Long resvId, @Param("resvStatus") Integer resvStatus, @Param("updatedBy") String updatedBy);

    void deleteReservation(Long resvId);
}