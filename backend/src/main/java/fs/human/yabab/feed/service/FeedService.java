package fs.human.yabab.feed.service;

import fs.human.yabab.feed.dao.FeedDAO;
import fs.human.yabab.feed.vo.CommentVO;
import fs.human.yabab.feed.vo.FeedVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
        feedVO.setFeedDeletedFlag(0);
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

    //  댓글 수정
    public boolean updateCommentContent(CommentVO commentVO) {
        return feedDAO.updateCommentContent(commentVO) > 0;
    }

    //  댓글 삭제
    public boolean softDeleteComment(int commentId) {
        return feedDAO.softDeleteComment(commentId) > 0;
    }

    //  피드 삭제
    public boolean deleteFeedById(int feedId) {
        return feedDAO.markFeedAsDeleted(feedId) > 0;
    }

    //  피드 수정
    public boolean updateFeed(Map<String, String> params, MultipartFile imageFile) {
        try {
            String imagePath = null;

            // 1. 이미지가 새로 업로드된 경우 저장 처리
            if (imageFile != null && !imageFile.isEmpty()) {
                String uploadDir = "/upload/feed"; // 실제 서버 경로로 변경 필요
                String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
                File dest = new File(uploadDir, fileName);
                imageFile.transferTo(dest);
                imagePath = "/upload/feed/" + fileName; // DB에 저장할 경로
            }

            // 2. DAO 호출
            return feedDAO.updateFeed(params, imagePath) > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
