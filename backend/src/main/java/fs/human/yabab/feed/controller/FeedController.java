package fs.human.yabab.feed.controller;

import fs.human.yabab.feed.service.FeedService;
import fs.human.yabab.feed.vo.FeedVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    //  application.properties에서 이미지 업로드 디렉토리 경로 주입
    @Value("${upload.uploads.image.dir}")
    private String uploadDirectory;

    //  피드 목록 조회(팀 ID 기준)
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<FeedVO>> fetchFeedList(
            @PathVariable int teamId,
            @RequestParam(name = "category", required = false) int category,                         //  0 or 1
            @RequestParam(name = "sort", required = false, defaultValue = "latest") String sort  //  latest or likes
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

        //  이미지 파일이 있을 경우 저장 처리
        if (feedImage != null && !feedImage.isEmpty()) {
            //  원본 파일명 + UUID를 이용해 파일명 중복 방지
            String originalFilename = feedImage.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID() + "_" + originalFilename;

            //  디렉토리가 없으면 생성
            File directory = new File(uploadDirectory);
            if(!directory.exists()) {
                directory.mkdirs();
            }

            File destinationFile = new File(directory, uniqueFileName);

            try {
                feedImage.transferTo(destinationFile);

                //  vo에 이미지 경로와 파일명 저장
                feedVO.setFeedImageName(uniqueFileName);    //  DB에 저장
                feedVO.setFeedImagePath("/uploads/" + uniqueFileName);  //  프론트에서 접근 가능한 경로
            } catch (IOException e) {
                e.printStackTrace();
                responseMap.put("success", false);
                responseMap.put("message", "파일 저장 실패");
                return ResponseEntity.internalServerError().body(responseMap);
            }
        }

        //  DB에 글 등록
        feedService.registerFeed(feedVO);
        responseMap.put("success", true);
        responseMap.put("message", "등록 성공");
        return ResponseEntity.ok(responseMap);
    }

    //  피드 상세 조회(피드 ID 기준)
    @GetMapping("/detail/{feedId}")
    public ResponseEntity<Map<String, Object>> fetchFeedDetail(@PathVariable int feedId) {
        FeedVO feed = feedService.getFeedDetail(feedId);

        Map<String, Object> responseMap = new HashMap<>();

        if(feed != null) {
            responseMap.put("success", true);
            responseMap.put("feed", feed);
        } else {
            responseMap.put("success", false);
            responseMap.put("message", "해당 게시글이 존재하지 않습니다.");
        }
        return ResponseEntity.ok(responseMap);
    }

}
