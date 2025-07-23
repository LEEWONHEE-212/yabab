package fs.human.yabab.Stadium.service;

import fs.human.yabab.Stadium.dao.KakaoMapDAO;
import fs.human.yabab.Stadium.vo.KakaoMapDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KakaoMapService {
    @Autowired // KakaoMapDAO를 주입받음
    private KakaoMapDAO kakaoMapDAO;

    public KakaoMapDTO getStadiumLocation(Long stadiumId) {
        // KakaoMapDAO를 통해 DB에서 경기장 정보를 직접 조회
        // KakaoMapDAO의 findStadiumById 메서드는 KakaoMapDTO를 반환하도록 매핑되어 있습니다.
        KakaoMapDTO stadiumInfo = kakaoMapDAO.findStadiumById(stadiumId);

        return stadiumInfo;
    }
}
