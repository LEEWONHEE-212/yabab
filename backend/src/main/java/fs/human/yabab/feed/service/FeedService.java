package fs.human.yabab.feed.service;

import fs.human.yabab.feed.dao.FeedDAO;
import fs.human.yabab.feed.vo.FeedVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedService {

    @Autowired
    private FeedDAO feedDAO;

    //  피드 목록 조회
    public List<FeedVO> getFeedList(int teamId, int category, String sort) {
        return feedDAO.selectFeedList(teamId, category, sort);
    }

    //  피드 등록
    public void registerFeed(FeedVO feedVO) {
        feedDAO.insertFeed(feedVO);
    }
}
