package fs.human.yabab.feed.controller;

import fs.human.yabab.feed.service.FeedService;
import fs.human.yabab.feed.vo.CommentVO;
import fs.human.yabab.feed.vo.FeedVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus; // ⭐ HttpStatus import 추가 ⭐
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException; // ⭐ ResponseStatusException import 추가 ⭐

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/feed")
@CrossOrigin(origins = "http://localhost:3000")
public class FeedController {

    @Autowired
    private FeedService feedService;

    // application.properties에서 이미지 업로드 디렉토리 경로 주입
    @Value("${upload.uploads.image.dir}")
    private String uploadDirectory;

    // 피드 목록 조회(팀 ID 기준)
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<FeedVO>> fetchFeedList(
            @PathVariable int teamId,
            @RequestParam(name = "category", required = false) int category,                         // 0 or 1
            @RequestParam(name = "sort", required = false, defaultValue = "latest") String sort  // latest or likes
    ) {
        List<FeedVO> list = feedService.getFeedList(teamId, category, sort);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/write")
    public ResponseEntity<Map<String, Object>> writeFeed(
            @ModelAttribute FeedVO feedVO,  // VO로 대부분의 값 자동 바인딩
            @RequestParam(value = "feedImage", required = false) MultipartFile feedImage
    ) {
        Map<String, Object> responseMap = new HashMap<>();

        // 이미지 파일이 있을 경우 저장 처리
        if (feedImage != null && !feedImage.isEmpty()) {
            String originalFilename = feedImage.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID() + "_" + originalFilename;

            try {
                // 상대경로 → 절대경로로 변환
                String resolvedPath = new File(uploadDirectory).getAbsolutePath();
                File directory = new File(resolvedPath);

                if (!directory.exists()) {
                    directory.mkdirs();  // 디렉토리 없으면 생성
                }

                File destinationFile = new File(directory, uniqueFileName);
                feedImage.transferTo(destinationFile);

                // 저장 정보 VO에 입력
                feedVO.setFeedImageName(uniqueFileName);  // DB 저장용
                feedVO.setFeedImagePath("/uploads/" + uniqueFileName);  // 프론트 접근용
            } catch (IOException e) {
                e.printStackTrace();
                responseMap.put("success", false);
                responseMap.put("message", "파일 저장 실패");
                return ResponseEntity.internalServerError().body(responseMap);
            }
        }

        // feedDeletedFlag 명시적으로 0으로 설정
        feedVO.setFeedDeletedFlag(0);

        // DB에 글 등록
        feedService.registerFeed(feedVO);
        responseMap.put("success", true);
        responseMap.put("message", "등록 성공");
        return ResponseEntity.ok(responseMap);
    }

    // 피드 상세 조회(피드 ID 기준)
    @GetMapping("/detail/{feedId}")
    public ResponseEntity<Map<String, Object>> fetchFeedDetail(
            @PathVariable int feedId,
            @RequestParam(name = "userId", required = false ) String userId
    ) {
        FeedVO feed = feedService.getFeedDetail(feedId);

        Map<String, Object> responseMap = new HashMap<>();

        if(feed != null) {
            responseMap.put("success", true);
            responseMap.put("feed", feed);

            if(userId != null) {
                boolean liked = feedService.hasUserLikedFeed(feedId, userId);
                responseMap.put("liked", liked);
            }
            List<CommentVO> comments = feedService.getCommentsByFeedId(feedId, userId);
            responseMap.put("comments", comments);
        } else {
            responseMap.put("success", false);
            responseMap.put("message", "해당 게시글이 존재하지 않습니다.");
        }
        return ResponseEntity.ok(responseMap);
    }

    // 추천 기능
    @PostMapping("/like/{feedId}")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable int feedId,
            @RequestBody Map<String, String> requestMap
    ) {
        String userId = requestMap.get("userId");  // 프론트에서 보내준 userId

        // 로그인 여부 확인
        if(userId == null || userId.trim().isEmpty()) {
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("success", false);
            responseMap.put("message", "로그인이 필요합니다.");
            return ResponseEntity.badRequest().body(responseMap);
        }
        boolean liked = feedService.toggleFeedLike(feedId, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("liked", liked);   // true: 추천됨, false: 추천 취소됨

        return ResponseEntity.ok(response);
    }

    // 댓글 등록
    @PostMapping("/comment")
    public ResponseEntity<Map<String, Object>> addComment(@RequestBody CommentVO commentVO) {
        feedService.addComment(commentVO);
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("success", true);
        responseMap.put("message","댓글이 등록되었습니다.");
        return ResponseEntity.ok(responseMap);
    }

    // 댓글 추천 기능
    @PostMapping("/comment/like/{commentId}")
    public ResponseEntity<Map<String, Object>> toggleCommentLike(
            @PathVariable int commentId,
            @RequestBody Map<String, String> requestBody
    ) {
        String userId = requestBody.get("userId");
        Map<String,Object> responseMap = new HashMap<>();

        if(userId == null) {
            responseMap.put("success", false);
            responseMap.put("message", "로그인이 필요합니다.");
            return ResponseEntity.badRequest().body(responseMap);
        }

        boolean liked = feedService.toggleCommentLike(commentId, userId);
        responseMap.put("success", true);
        responseMap.put("liked", liked);
        return ResponseEntity.ok(responseMap);
    }

    // Top 5 피드 조회 (응원글)
    @GetMapping("/{teamId}/top5")
    public ResponseEntity<Map<String, Object>> fetchTop5Feeds(
            @PathVariable int teamId,
            @RequestParam(name = "category", defaultValue = "0") int category
    ) {
        Map<String, Object> responseMap = new HashMap<>();
        List<FeedVO> top5List = feedService.getTop5FeedsByTeamAndCategory(teamId, category);

        responseMap.put("success", true);
        responseMap.put("feedList", top5List);
        return ResponseEntity.ok(responseMap);
    }

    // 댓글 수정
    @PutMapping("/comment/update")
    public ResponseEntity<Map<String, Object>> updateComment(@RequestBody CommentVO commentVO) {
        Map<String, Object> responseMap = new HashMap<>();
        boolean updated = feedService.updateCommentContent(commentVO);

        responseMap.put("success", updated);
        return ResponseEntity.ok(responseMap);
    }

    // 댓글 삭제
    @DeleteMapping("/comment/delete/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(@PathVariable int commentId) {
        Map<String, Object> responseMap = new HashMap<>();
        boolean deleted = feedService.softDeleteComment(commentId); // ⭐ 소프트 삭제 유지 ⭐

        responseMap.put("success", deleted);
        return ResponseEntity.ok(responseMap);
    }

    // 피드 삭제 (물리적 삭제로 변경)
    @DeleteMapping("/delete/{feedId}")
    public ResponseEntity<Map<String, Object>> deleteFeed(@PathVariable int feedId) { // ⭐ 반환 타입 ResponseEntity로 변경 ⭐
        Map<String, Object> responseMap = new HashMap<>();
        try {
            boolean deleted = feedService.deleteFeedById(feedId); // ⭐ 물리적 삭제 서비스 메서드 호출 ⭐
            if (deleted) {
                responseMap.put("success", true);
                responseMap.put("message", "피드 및 관련 데이터가 성공적으로 삭제되었습니다.");
                return ResponseEntity.ok(responseMap); // 200 OK
            } else {
                responseMap.put("success", false);
                responseMap.put("message", "피드 삭제에 실패했습니다.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap); // 500 Internal Server Error
            }
        } catch (RuntimeException e) { // Service에서 던지는 RuntimeException을 캐치
            System.err.println("피드 삭제 중 오류 발생: " + e.getMessage());
            responseMap.put("success", false);
            responseMap.put("message", "피드 삭제 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap); // 500 Internal Server Error
        } catch (Exception e) {
            System.err.println("예상치 못한 피드 삭제 오류 발생: " + e.getMessage());
            e.printStackTrace();
            responseMap.put("success", false);
            responseMap.put("message", "피드 삭제 중 예상치 못한 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap); // 500 Internal Server Error
        }
    }

    // 피드 수정
    @PutMapping("/update")
    public Map<String, Object> updateFeed(@RequestParam Map<String, String> params,
                                          @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        Map<String, Object> responseMap = new HashMap<>();
        boolean result = feedService.updateFeed(params, imageFile);
        responseMap.put("success", result);
        return responseMap;
    }
}
