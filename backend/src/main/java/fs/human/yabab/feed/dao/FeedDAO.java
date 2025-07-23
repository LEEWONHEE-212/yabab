package fs.human.yabab.feed.dao;

import fs.human.yabab.feed.vo.FeedVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeedDAO {
    //  피드 리스트 조회
    List<FeedVO> selectFeedList(
            @Param("teamId") int teamId,
            @Param("category") int category,
            @Param("sort") String sort);

    //  피드 글쓰기
    int insertFeed(FeedVO feedVO);
}
