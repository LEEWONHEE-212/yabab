package fs.human.yabab.KakaoAuth.dao;

import fs.human.yabab.KakaoAuth.vo.KakaoAuthUserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {

    KakaoAuthUserVO findByUserId(@Param("userId") String userId);

    int insertUser(KakaoAuthUserVO user);
}
