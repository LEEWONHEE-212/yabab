package fs.human.yabab.feed.controller;

import fs.human.yabab.feed.service.FeedService;
import fs.human.yabab.feed.vo.FeedVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/feed")
@CrossOrigin(origins = "http://192.168.0.47:3000")
public class FeedController {

    @Autowired
    private FeedService feedService;

    @GetMapping("/{teamId}")
    public ResponseEntity<List<FeedVO>> fetchFeedList(
            @PathVariable int teamId,
            @RequestParam int category,                         //  0 or 1
            @RequestParam(defaultValue = "latest") String sort  //  latest or likes
    ) {
        List<FeedVO> list = feedService.getFeedList(teamId, category, sort);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/write")
    public ResponseEntity<String> writeFeed(
            @ModelAttribute FeedVO feedVO,  // ✅ VO로 대부분의 값 자동 바인딩
            @RequestParam(value = "feedImage", required = false) MultipartFile feedImage
    ) {
        if (feedImage != null && !feedImage.isEmpty()) {
            String fileName = feedImage.getOriginalFilename();
            String savePath = "C:/feed_images/" + fileName;

            try {
                feedImage.transferTo(new File(savePath));
                feedVO.setFeedImageName(fileName);
                feedVO.setFeedImagePath(savePath);
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().body("파일 저장 실패");
            }
        }

        feedService.registerFeed(feedVO);
        return ResponseEntity.ok("등록 성공");
    }

}
