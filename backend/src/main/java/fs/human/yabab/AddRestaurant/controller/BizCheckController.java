package fs.human.yabab.AddRestaurant.controller;

import fs.human.yabab.AddRestaurant.vo.FullBizInfoCheckRequest;
import fs.human.yabab.AddRestaurant.service.BizCheckService;
import fs.human.yabab.AddRestaurant.vo.BizCheckRequest;
import fs.human.yabab.AddRestaurant.vo.BizCheckResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://localhost:3000")
public class BizCheckController {

    @Autowired
    private BizCheckService bizCheckService;

    @PostMapping("/check-biz-number")
    public ResponseEntity<BizCheckResponse> checkBusinessNumber(@RequestBody BizCheckRequest request) {
        if (request.getB_no() == null || request.getB_no().trim().isEmpty()) {
            BizCheckResponse resp = new BizCheckResponse();
            resp.setValid(false);
            resp.setMessage("사업자 번호를 입력해주세요.");
            return ResponseEntity.badRequest().body(resp);
        }

        BizCheckResponse response = bizCheckService.checkBizNumberStatus(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/check-biz-info-full")
    public ResponseEntity<BizCheckResponse> checkFullBusinessInfo(@RequestBody FullBizInfoCheckRequest request) {
        if (request.getB_no() == null || request.getB_no().trim().isEmpty() ||
                request.getRestaurantName() == null || request.getRestaurantName().trim().isEmpty() ||
                request.getStart_dt() == null || request.getStart_dt().trim().isEmpty() ||
                request.getP_nm() == null || request.getP_nm().trim().isEmpty()) {

            BizCheckResponse resp = new BizCheckResponse();
            resp.setValid(false);
            resp.setMessage("모든 필수 사업자 정보를 입력해주세요 (사업자번호, 상호, 개업일, 대표자명).");
            return ResponseEntity.badRequest().body(resp);
        }

        BizCheckResponse response = bizCheckService.validateFullBusinessInfo(request);
        return ResponseEntity.ok(response);
    }
}