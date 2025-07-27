package fs.human.yabab.MyPage.dao;

import fs.human.yabab.MyPage.vo.MyPageEditDTO;
import fs.human.yabab.MyPage.vo.MyPageTeamDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyPageEditDAO {
    // 1. TB_TEAM 테이블에서 모든 팀 목록 조회 (MyPageTeamDTO 사용)
    List<MyPageTeamDTO> selectAllTeams();

    // 2. TB_USER 테이블에서 특정 userId의 전체 프로필 정보 조회 (MyPageEditDTO 사용)
    // 이 메서드를 통해 기존 사용자 정보 (텍스트 및 이미지 경로)를 가져옵니다.
    MyPageEditDTO selectUserProfileById(@Param("userId") String userId);

    // 3. TB_USER 테이블의 회원 정보 (텍스트 및 이미지 경로)를 한 번에 업데이트 (MyPageEditDTO 사용)
    // 기존 updateUserInfo와 updateUserProfileImage를 대체하는 단일 업데이트 메서드입니다.
    int updateUserProfile(MyPageEditDTO myPageEditDTO);

    // 4. TB_USER 테이블에서 특정 userId의 프로필 이미지 정보를 초기화 (삭제)
    int deleteUserProfileImage(@Param("userId") String userId);
}
