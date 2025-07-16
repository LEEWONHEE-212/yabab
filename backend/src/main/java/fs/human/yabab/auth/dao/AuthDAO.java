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

    //  토큰 발급 정보 저장
    int insertResetToken(ResetTokenVO resetTokenVO);

    //  토큰 조회 (검증 시 사용)
    ResetTokenVO selectResetToken(@Param("tokenId") String tokenId);

    //  토큰 사용 처리
    int updateTokenUsedFlag(@Param("tokenId") String tokenId);

    //  이메일 인증 여부 확인용
    int countVerifiedTokenByEmail(@Param("email") String email);

    //  이메일 인증 전용 TB_USER에 검증 완료 상태 업데이트
    int updateUserEmailVerified(@Param("userEmail") String userEmail);
}