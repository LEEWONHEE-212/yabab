package fs.human.yabab.auth.dao;

import fs.human.yabab.auth.vo.UserVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AuthDAO {
    int insertUser(UserVO userVO);
}