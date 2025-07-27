// src/main/java/fs/human/yabab/KakaoAuth/dao/UserMapper.java
package fs.human.yabab.KakaoAuth.dao;

import fs.human.yabab.KakaoAuth.vo.KakaoAuthUserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    KakaoAuthUserVO findByUserId(@Param("userId") String userId);
    int insertUser(KakaoAuthUserVO user);

    /**
     * 카카오 로그인 시 기존 사용자의 정보를 업데이트합니다.
     * (전화번호, 프로필 이미지 경로/이름 등)
     * @param user 업데이트할 사용자 정보 (KakaoAuthUserVO)
     * @return 업데이트된 행의 수
     */
    int updateUserForKakaoLogin(KakaoAuthUserVO user); // ⭐ 추가된 메서드 ⭐
}
