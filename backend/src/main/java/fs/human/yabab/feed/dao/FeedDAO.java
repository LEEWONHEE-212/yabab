package fs.human.yabab.feed.dao;

import fs.human.yabab.feed.vo.CommentVO;
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

    //  피드 상세
    FeedVO selectFeedDetail(int feedId);

    //  추천 여부 확인
    int hasUserLikedFeed(@Param("feedId") int feedId, @Param("userId") String userId);

    //  추천 등록
    void insertFeedLike(@Param("feedId") int feedId, @Param("userId") String userId);

    //  추천 취소
    void deleteFeedLike(@Param("feedId") int feedId, @Param("userId") String userId);

    //  게시글 추천 수 증가
    void incrementFeedLikes(@Param("feedId") int feedId);

    //  게시글 추천 수 감소
    void decrementFeedLikes(@Param("feedId") int feedId);

    //  댓글 목록
    List<CommentVO> selectCommentsByFeedId(@Param("feedId") int feedId);

    //  댓글 추가
    void insertComment(CommentVO commentVO);

    //  댓글 관련
    boolean hasUserLikedComment(@Param("commentId") int commentId, @Param("userId") String userId);
    int insertCommentLike(@Param("commentId") int commentId, @Param("userId") String userId);
    int deleteCommentLike(@Param("commentId") int commentId, @Param("userId") String userId);
    int incrementCommentLikes(@Param("commentId") int commentId);
    int decrementCommentLikes(@Param("commentId") int commentId);
    int countLikesForComment(int commentId);

    //  조회수
    void incrementFeedViews(@Param("feedId") int feedId);

    //  Top 5 피드 조회
    List<FeedVO> selectTop5FeedsByTeamAndCategory(@Param("teamId") int teamId, @Param("category") int category);

}
