package fs.human.yabab.auth.dao;

import fs.human.yabab.auth.vo.ResetTokenVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ResetTokenDAO {
    //  인증코드 발급
    int insertResetToken(ResetTokenVO resetTokenVO);

    //  이메일 인증 확인
    int countVerifiedTokenByEmail(String email);

    //  인증코드 확인
    ResetTokenVO findTokenByEmailAndCode(@Param("email")String email, @Param("code")String code);

    //  토큰 사용 처리
    int useToken(@Param("tokenId") String tokenId);
}
