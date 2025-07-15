package fs.human.yabab.auth.controller;

import fs.human.yabab.auth.service.AuthService;
import fs.human.yabab.auth.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/yabab")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    //  회원가입
    @PostMapping("/addUser")
    public ResponseEntity<Map<String, Object>> insertUser(@RequestBody UserVO userVO) {
        Map<String, Object> responseMap = new HashMap<>();
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
}
