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

    public boolean insertUser(UserVO userVO) {
        return authDAO.insertUser(userVO) > 0;
    }
}
