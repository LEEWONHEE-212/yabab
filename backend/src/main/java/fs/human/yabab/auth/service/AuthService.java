package fs.human.yabab.auth.service;

import fs.human.yabab.auth.dao.AuthDAO;
import fs.human.yabab.auth.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    @Autowired
    private AuthDAO authDAO;

    //  회원가입
    public boolean insertUser(UserVO userVO) {
        return authDAO.insertUser(userVO) > 0;
    }

    //  아이디 중복 확인
    public boolean checkUserIdDuplicate(String userId) {
        return authDAO.countUserId(userId) > 0;
    }

    //  닉네임 중복 확인
    public boolean checkUserNicknameDuplicate(String userNickname) {
        return authDAO.countUserNickname(userNickname) > 0;
    }

    //  이메일 인증 요청
    public boolean checkEmailVerified(String email) {
        return authDAO.countVerifiedTokenByEmail(email) > 0;
    }
}
