package fs.human.yabab.feed.service;

import fs.human.yabab.feed.dao.FeedDAO;
import fs.human.yabab.feed.vo.CommentVO;
import fs.human.yabab.feed.vo.FeedVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FeedService {

    @Autowired
    private FeedDAO feedDAO;

    @Value("${upload.uploads.image.dir}")
    private String uploadDirectory;

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
            String imagePathForDb = null; // DB에 저장할 경로 (웹 접근 경로)
            String imageNameForDb = null; // DB에 저장할 파일명

            // 1. 이미지가 새로 업로드된 경우 저장 처리
            if (imageFile != null && !imageFile.isEmpty()) {
                String originalFilename = imageFile.getOriginalFilename();
                String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFilename;

                // application.properties에서 주입받은 상대 경로를 절대 경로로 변환하여 사용
                Path targetDirectory = Paths.get(new File(uploadDirectory).getAbsolutePath());
                Path targetFilePath = targetDirectory.resolve(uniqueFileName);

                // 업로드 디렉토리가 없으면 생성 (FeedController의 writeFeed와 동일하게)
                if (!Files.exists(targetDirectory)) {
                    Files.createDirectories(targetDirectory);
                }

                imageFile.transferTo(targetFilePath.toFile()); // 파일 저장

                // ⭐ 이 부분이 수정되었습니다: 파일명을 포함한 전체 웹 경로 ⭐
                imagePathForDb = "/uploads/" + uniqueFileName;
                imageNameForDb = uniqueFileName;
            } else {
                // 이미지가 새로 업로드되지 않은 경우, 기존 정보 유지 또는 삭제
                // params에서 기존 imagePath와 imageName을 가져와 사용
                imagePathForDb = params.get("feedImagePath");
                imageNameForDb = params.get("feedImageName");

                // 만약 프론트에서 이미지 삭제를 요청했다면 (imagePath, imageName이 null로 옴)
                // 이 경우, DB에 NULL을 저장하도록 DAO에서 처리할 것임.
                // 여기서는 물리 파일 삭제 로직은 포함하지 않음 (별도 API 또는 로직으로 처리 권장)
            }

            // 2. DAO 호출을 위한 Map에 이미지 정보 추가
            // params 맵은 불변일 수 있으므로 새로운 맵을 만들거나, params를 수정 가능한 맵으로 변환
            Map<String, String> updateParams = new HashMap<>(params);
            updateParams.put("feedImagePath", imagePathForDb);
            updateParams.put("feedImageName", imageNameForDb);

            return feedDAO.updateFeed(updateParams) > 0; // DAO 호출 시 수정된 맵 사용
        } catch (IOException e) {
            System.err.println("파일 저장 실패: " + e.getMessage());
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("피드 업데이트 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
