package fs.human.yabab.auth.dao;

import fs.human.yabab.auth.vo.ResetTokenVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ResetTokenDAO {
    //  인증코드 발급
    int insertResetToken(ResetTokenVO resetTokenVO);

    //  이메일 인증 확인
    int countVerifiedTokenByEmail(String email);
}
