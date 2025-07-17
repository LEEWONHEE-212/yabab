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
}