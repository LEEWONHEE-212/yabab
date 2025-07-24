package fs.human.yabab.MyPage.dao;

import fs.human.yabab.MyPage.vo.MyPageEditDTO;
import fs.human.yabab.MyPage.vo.MyPageTeamDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyPageEditDAO {
    // 1. TB_TEAM 테이블에서 모든 팀 목록 조회
    List<MyPageTeamDTO> selectAllTeams();

    // 2. TB_USER 테이블의 회원 일반 정보 업데이트
    int updateUserInfo(MyPageEditDTO myPageEditDTO);

    // 3. TB_USER 테이블에서 특정 userId의 프로필 이미지 경로와 파일명 업데이트
    int updateUserProfileImage(
            @Param("userId") String userId,
            @Param("userImagePath") String userImagePath,
            @Param("userImageName") String userImageName
    );

    // 4. TB_USER 테이블에서 특정 userId의 프로필 이미지 정보를 초기화 (삭제)
    int deleteUserProfileImage(@Param("userId") String userId);
}