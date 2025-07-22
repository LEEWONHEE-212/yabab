package fs.human.yabab.auth.service;

import fs.human.yabab.auth.dao.AuthDAO;
import fs.human.yabab.auth.dao.ResetTokenDAO;
import fs.human.yabab.auth.vo.ResetTokenVO;
import fs.human.yabab.auth.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Random;

@Service
@Transactional
public class AuthService {
    @Autowired
    private AuthDAO authDAO;

    @Autowired
    private ResetTokenDAO resetTokenDAO;

    @Autowired
    private MailService mailService;

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

//    //  이메일 인증 여부 확인
//    public boolean checkEmailVerified(String email) {
//        return resetTokenDAO.countVerifiedTokenByEmail(email) > 0;
//    }

    //  이메일 인증코드 생성 및 전송
    public void createAndSendAuthCode(String email) {
        String authCode = generateAuthCode();
        Date expiredTime = Date.from(   //  Date로 변환
                LocalDateTime.now() //  현재시작
                        .plusMinutes(5) //  5분 뒤 시각
                        .atZone(ZoneId.systemDefault()) // 타임존 부여
                        .toInstant()    //  UTC Instant 객체
        );

        ResetTokenVO token = new ResetTokenVO(email, authCode, expiredTime);
        resetTokenDAO.insertResetToken(token);

        mailService.sendVerificationEmail(email,authCode);
    }

    //  인증 코드 생성 (6자리)
    private String generateAuthCode() {
        return String.format("%06d", new Random().nextInt(1000000));
    }

    //  인증 코드 확인
    public boolean verifyAuthCode(String email, String authCode) {
        ResetTokenVO token = resetTokenDAO.findTokenByEmailAndCode(email, authCode);
        if(token != null ) {
            //  인증성공 -> 사용 처리
            resetTokenDAO.useToken(token.getTokenId());
            return true;
        }
        return false;
    }

    //  사용자 인증( userId, userPassword 일치 여부)
    public UserVO authenticateUser(String userId, String userPassword) {
        return authDAO.findUserByIdAndPw(userId, userPassword);
    }

    //  아이디 찾기
    public String findUserId(String userName, String userEmail) {
        return authDAO.findUserIdByNameAndEmail(userName, userEmail);
    }

    //  비밀번호 재설정
    public boolean updatePassword(UserVO userVO) {
        //  해당 아이디 + 이메일 조합이 존재하는지 확인
        int count = authDAO.countUserByIdAndEmail(userVO.getUserId(), userVO.getUserEmail());

        if(count == 0) {
            return false;
        } else {
            //  존재하면 비밀번호 업데이트 진행
            int updateRows = authDAO.updateUserPassword(userVO);
            return updateRows > 0;
        }
    }
}
