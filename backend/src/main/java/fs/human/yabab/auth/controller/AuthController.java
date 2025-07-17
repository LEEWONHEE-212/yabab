package fs.human.yabab.auth.controller;

import fs.human.yabab.auth.service.AuthService;
import fs.human.yabab.auth.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    //  회원가입
    @PostMapping("/addUser")
    public ResponseEntity<Map<String, Object>> insertUser(@RequestBody UserVO userVO) {
        Map<String, Object> responseMap = new HashMap<>();

        //  역할 유효성 검사
        List<String> allowedRoles = List.of("GUEST", "OWNER");
        if(!allowedRoles.contains(userVO.getUserRole())) {
            responseMap.put("success", false);
            responseMap.put("message", "허용되지 않은 사용자 역할입니다.");
            return ResponseEntity.badRequest().body(responseMap);
        }
        //  비밀번호 일치 여부 검사
        //  요청으로 들어온 password와 confirmPassword가 동일해야 회원가입 진행
        if(!userVO.getUserPassword().equals(userVO.getConfirmPassword())) {
            responseMap.put("success", false);
            responseMap.put("message", "비밀번호가 일치하지 않습니다.");
            return ResponseEntity.badRequest().body(responseMap);
        }

        //  회원가입 처리
        try{
            boolean success = authService.insertUser(userVO);

            if(success) {
                responseMap.put("success", true);
                responseMap.put("message", "회원가입 성공");
                return ResponseEntity.status(HttpStatus.CREATED).body(responseMap);
            } else {
                responseMap.put("success", false);
                responseMap.put("message", "회원가입 실패");
                return ResponseEntity.badRequest().body(responseMap);
            }
        } catch (Exception e) {
            responseMap.put("success", false);
            responseMap.put("message", "서버 오류" + e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //  아이디 중복 확인 api
    @GetMapping("/checkId")
    public ResponseEntity<Map<String, Object>> checkUserId(@RequestParam String userId) {
        //  응답을 담을 Map 객체 생성(응답 body 조립)
        Map<String, Object> responseMap = new HashMap<>();

        //  아이디 중복 여부 확인
        boolean userIdDuplicate = authService.checkUserIdDuplicate(userId);

        //  available: 중복O(false) -> 사용 불가, 중복X(true) -> 사용 가능
        responseMap.put("available", !userIdDuplicate);

        //  message: UI에 띄울 텍스트
        responseMap.put("message", userIdDuplicate
                            ? "이미 사용 중인 아이디입니다."
                            : "사용 가능한 아이디입니다."
        );
        //  200 OK와 함께 body 반환
        return ResponseEntity.ok(responseMap);
    }

    //  닉네임 중복 확인 api
    @GetMapping("/checkNickname")
    public ResponseEntity<Map<String, Object>> checkUserNickname(@RequestParam String userNickname) {
        Map<String, Object> responseMap = new HashMap<>();
        boolean userNicknameDuplicate = authService.checkUserNicknameDuplicate(userNickname);
        responseMap.put("available", !userNicknameDuplicate);
        responseMap.put("message", userNicknameDuplicate
                            ? "이미 사용 중인 닉네임입니다."
                            : "사용 가능한 닉네임입니다."
        );
        return ResponseEntity.ok(responseMap);
    }

    //  이메일 인증번호 전송
    @PostMapping("/sendAuthCode")
    public ResponseEntity<Map<String, Object>> sendAuthCode(@RequestParam String email) {
        Map<String, Object> responseMap = new HashMap<>();

        try{
            authService.createAndSendAuthCode(email);
            responseMap.put("result", true);
            responseMap.put("message", "인증 코드가 이메일로 전송되었습니다.");
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            responseMap.put("result", false);
            responseMap.put("message", "인증 코드 전송 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }
}
