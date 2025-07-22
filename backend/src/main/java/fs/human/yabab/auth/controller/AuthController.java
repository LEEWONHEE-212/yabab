package fs.human.yabab.auth.controller;

import fs.human.yabab.auth.service.AuthService;
import fs.human.yabab.auth.vo.UserVO;
import jakarta.servlet.http.HttpSession;
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
        System.out.println("🔍 [회원가입 요청] 받은 값: " + userVO);

        //  역할 유효성 검사
        List<Integer> allowedRoles = List.of(1, 2);
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
            e.printStackTrace();
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

    //  이메일 인증번호 확인
    @PostMapping("/verifyAuthCode")
    public ResponseEntity<Map<String, Object>> verifyAuthCode(@RequestBody Map<String, String> request) {
        Map<String, Object> responseMap = new HashMap<>();
        String email = request.get("email");
        String authCode = request.get("authCode");

        boolean verified = authService.verifyAuthCode(email, authCode);

        responseMap.put("verified", verified);
        responseMap.put("message", verified
                            ? "이메일 인증이 완료되었습니다."
                            : "인증 코드가 올바르지 않거나 만료되었습니다."
        );
        return ResponseEntity.ok(responseMap);
    }

    //  로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserVO userVO, HttpSession session) {
        Map<String, Object> responseMap = new HashMap<>();

        //  사용자 정보 DB에서 조회 (아이디 + 비밀번호 확인용")
        UserVO loginUser = authService.authenticateUser(userVO.getUserId(), userVO.getUserPassword());

        if(loginUser == null) {
            //  로그인 실패 시 메세지 전송
            responseMap.put("success", false);
            responseMap.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseMap);
        } else {

            //  로그인 성공 - 세션에 사용자 정보 저장
            session.setAttribute("loginUser", loginUser);

            //  성공 응답
            responseMap.put("success", true);
            responseMap.put("message", "로그인 성공");
            responseMap.put("user",loginUser);
            return ResponseEntity.ok(responseMap);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        //  현재 세션 무효화 -> 로그인 정보 초기화
        session.invalidate();

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("success", true);
        responseMap.put("message","로그아웃 완료");
        return ResponseEntity.ok(responseMap);
    }

    @PostMapping("/findId")
    public ResponseEntity<Map<String, Object>> findId(@RequestBody UserVO userVO) {
        Map<String, Object> responseMap = new HashMap<>();

        String foundId = authService.findUserId(userVO.getUserName(), userVO.getUserEmail());

        if(foundId != null) {
            responseMap.put("success", true);
            responseMap.put("userId", foundId);
        } else {
            responseMap.put("success", false);
            responseMap.put("message", "일치하는 회원 정보가 없습니다.");
        }

        return ResponseEntity.ok(responseMap);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody UserVO userVO) {
        Map<String, Object> responseMap = new HashMap<>();

        //  유효성 검사
        if(userVO.getUserId() == null || userVO.getUserEmail() == null || userVO.getUserPassword() == null) {
            responseMap.put("success", false);
            responseMap.put("message", "입력값이 누락되었습니다.");
            return ResponseEntity.badRequest().body(responseMap);
        }

        //  비밀번호 업데이트 시도
        boolean result = authService.updatePassword(userVO);

        if(result) {
            responseMap.put("success", true);
            responseMap.put("message", "비밀번호가 성공적으로 변경되었습니다.");
        } else {
            responseMap.put("success", false);
            responseMap.put("message", "일치하는 회원 정보가 없습니다.");
        }

        return ResponseEntity.ok(responseMap);

    }
}
