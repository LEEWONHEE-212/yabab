package fs.human.yabab.auth.dao;

import fs.human.yabab.auth.vo.ResetTokenVO;
import fs.human.yabab.auth.vo.UserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthDAO {
    //  회원가입
    int insertUser(UserVO userVO);

    //  아이디 중복 확인
    int countUserId(String userId);

    //  닉네임 중복 확인
    int countUserNickname(String userNickname);

    //  사용자 인증
    UserVO findUserByIdAndPw(@Param("userId") String userId, @Param("userPassword") String userPassword);

    //  아이디 찾기
    String findUserIdByNameAndEmail(@Param("userName") String userName, @Param("userEmail") String userEmail);

    //  유저 존재 확인
    int countUserByIdAndEmail(@Param("userId") String userId, @Param("userEmail") String userEmail);

    //  비밀번호 업데이트
    int updateUserPassword(UserVO userVo);
}