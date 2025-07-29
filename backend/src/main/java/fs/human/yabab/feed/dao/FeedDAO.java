package fs.human.yabab.feed.dao;

import fs.human.yabab.feed.vo.CommentVO;
import fs.human.yabab.feed.vo.FeedVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface FeedDAO {
    // 피드 리스트 조회
    List<FeedVO> selectFeedList(
            @Param("teamId") int teamId,
            @Param("category") int category,
            @Param("sort") String sort);

    // 피드 글쓰기
    int insertFeed(FeedVO feedVO);

    // 피드 상세
    FeedVO selectFeedDetail(int feedId);

    // 추천 여부 확인
    int hasUserLikedFeed(@Param("feedId") int feedId, @Param("userId") String userId);

    // 추천 등록
    void insertFeedLike(@Param("feedId") int feedId, @Param("userId") String userId);

    // 추천 취소
    void deleteFeedLike(@Param("feedId") int feedId, @Param("userId") String userId);

    // 게시글 추천 수 증가
    void incrementFeedLikes(@Param("feedId") int feedId);

    // 게시글 추천 수 감소
    void decrementFeedLikes(@Param("feedId") int feedId);

    // 댓글 목록
    List<CommentVO> selectCommentsByFeedId(@Param("feedId") int feedId);

    // 댓글 추가
    void insertComment(CommentVO commentVO);

    // 댓글 관련
    boolean hasUserLikedComment(@Param("commentId") int commentId, @Param("userId") String userId);
    int insertCommentLike(@Param("commentId") int commentId, @Param("userId") String userId);
    int deleteCommentLike(@Param("commentId") int commentId, @Param("userId") String userId);
    int incrementCommentLikes(@Param("commentId") int commentId);
    int decrementCommentLikes(@Param("commentId") int commentId);
    int countLikesForComment(int commentId);

    // 조회수
    void incrementFeedViews(@Param("feedId") int feedId);

    // Top 5 피드 조회
    List<FeedVO> selectTop5FeedsByTeamAndCategory(@Param("teamId") int teamId, @Param("category") int category);

    // 댓글 수정/삭제
    int updateCommentContent(CommentVO commentVO);
    int softDeleteComment(int commentId);

    // 피드 삭제 (소프트 삭제)
    int markFeedAsDeleted(@Param("feedId") int feedId);

    // 피드 수정
    // 파라미터를 Map 하나로 통일합니다.
    int updateFeed(Map<String, String> params);

    // ⭐ 새로 추가된 메서드들: 피드 관련 모든 댓글 물리적 삭제 ⭐
    int hardDeleteFeedCommentsByFeedId(@Param("feedId") int feedId);

    // ⭐ 새로 추가된 메서드들: 피드 관련 모든 추천 기록 물리적 삭제 ⭐
    int hardDeleteFeedLikesByFeedId(@Param("feedId") int feedId);

    // ⭐ 새로 추가된 메서드들: 피드 물리적 삭제 ⭐
    int hardDeleteFeedById(@Param("feedId") int feedId);
}
