package fs.human.yabab.feed.service;

import fs.human.yabab.feed.dao.FeedDAO;
import fs.human.yabab.feed.vo.CommentVO;
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

    //  피드 상세
    public FeedVO getFeedDetail(int feedId) {
        feedDAO.incrementFeedViews(feedId);
        return feedDAO.selectFeedDetail(feedId);
    }

    //  추천 여부
    public boolean hasUserLikedFeed(int feedId, String userId) {
        return feedDAO.hasUserLikedFeed(feedId, userId) > 0;
    }

    //  추천 토글 기능
    public boolean toggleFeedLike(int feedId, String userId) {
        if(hasUserLikedFeed(feedId, userId)) {
            feedDAO.deleteFeedLike(feedId, userId);
            feedDAO.decrementFeedLikes(feedId);
            return false;   //  추천 취소됨
        } else {
            feedDAO.insertFeedLike(feedId, userId);
            feedDAO.incrementFeedLikes(feedId);
            return true;    //  추천됨
        }
    }

    //  댓글 목록
    public List<CommentVO> getCommentsByFeedId(int feedId, String userId) {
        List<CommentVO> comments = feedDAO.selectCommentsByFeedId(feedId);
        for (CommentVO c : comments) {
            int likeCount = feedDAO.countLikesForComment(c.getCommentId());
            c.setCommentLikes(likeCount);

            //  로그인한 사용자만 추천 여부 조회
            if(userId != null) {
                boolean liked = feedDAO.hasUserLikedComment(c.getCommentId(), userId);
                c.setCommentLiked(liked);
            } else {
                c.setCommentLiked(false);   //  비로그인 사용자일 경우 false로 기본 설정
            }
        }
        return comments;
    }

    //  댓글 추가
    public void addComment(CommentVO commentVO) {
        feedDAO.insertComment(commentVO);
    }

    //  댓글 추천
    public boolean toggleCommentLike(int commentId, String userId) {
        boolean alreadyLiked = feedDAO.hasUserLikedComment(commentId, userId);

        if(alreadyLiked) {
            feedDAO.deleteCommentLike(commentId, userId);
            feedDAO.decrementCommentLikes(commentId);
        } else {
            feedDAO.insertCommentLike(commentId, userId);
            feedDAO.incrementCommentLikes(commentId);
        }

        return !alreadyLiked;
    }

    // Top 5 피드 조회
    public List<FeedVO> getTop5FeedsByTeamAndCategory(int teamId, int category) {
        return feedDAO.selectTop5FeedsByTeamAndCategory(teamId, category);
    }
}
