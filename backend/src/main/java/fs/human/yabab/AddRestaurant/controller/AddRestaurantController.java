package fs.human.yabab.AddRestaurant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fs.human.yabab.AddRestaurant.service.AddRestaurantService;
import fs.human.yabab.AddRestaurant.vo.RestaurantRegisterRequest;
import fs.human.yabab.AddRestaurant.vo.StadiumDTO;
import fs.human.yabab.AddRestaurant.vo.ZoneDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://localhost:3000")
public class AddRestaurantController {
    private final AddRestaurantService addRestaurantService;
    private final ObjectMapper objectMapper;

    @Autowired
    public AddRestaurantController(AddRestaurantService addRestaurantService, ObjectMapper objectMapper) {
        this.addRestaurantService = addRestaurantService;
        this.objectMapper = objectMapper;
    }

    // 기존 getAllStadiums 메서드 (변경 없음)
    @GetMapping("/stadiums/names-ids")
    public ResponseEntity<List<StadiumDTO>> getStadiumNamesAndIds() {
        try {
            List<StadiumDTO> stadiums = addRestaurantService.getAllStadiums();
            return ResponseEntity.ok(stadiums);
        } catch (Exception e) {
            System.err.println("구장 목록 조회 중 서버 오류 발생: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "구장 목록을 불러오는데 실패했습니다.", e);
        }
    }

    // 기존 getZonesByStadiumId 메서드 (변경 없음)
    @GetMapping("/stadiums/{stadiumId}/zones")
    public ResponseEntity<List<ZoneDTO>> getZonesByStadiumId(@PathVariable Long stadiumId) {
        try {
            if (stadiumId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "stadiumId는 필수입니다.");
            }
            List<ZoneDTO> zones = addRestaurantService.getZonesForStadium(stadiumId);
            return ResponseEntity.ok(zones);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("구역 목록 조회 중 서버 오류 발생 (stadiumId: " + stadiumId + "): " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "구역 목록을 불러오는데 실패했습니다.", e);
        }
    }

    // 식당 등록 메서드: 파일 업로드 관련 부분 집중 수정
    @PostMapping(value = "/register", consumes = {"multipart/form-data"})
    public ResponseEntity<String> registerRestaurant(
            @RequestPart("request") String restaurantRegisterRequestJson,
            @RequestPart(value = "restaurantImageFile", required = false) MultipartFile restaurantImageFile
    ) {
        RestaurantRegisterRequest request;
        try {
            request = objectMapper.readValue(restaurantRegisterRequestJson, RestaurantRegisterRequest.class);
            request.setRestaurantImageFile(restaurantImageFile);
        } catch (IOException e) {
            System.err.println("JSON 데이터 파싱 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("잘못된 요청 데이터 형식입니다. JSON 파싱 오류: " + e.getMessage());
        }

        // --- 파일 관련 유효성 검사 (기존과 동일) ---
        if (restaurantImageFile != null && restaurantImageFile.isEmpty()) {
            return ResponseEntity.badRequest().body("선택된 이미지 파일이 비어있습니다. 유효한 파일을 업로드해주세요.");
        }
        // ... (필수 항목에 대한 기본적인 유효성 검사도 기존과 동일) ...


        // --- restaurantInsideFlag 논리 검사 수정 ---
        // 새로운 논리: 0이 내부, 1이 외부
        // Boolean 매핑: false -> 0 (내부), true -> 1 (외부)

        if (!request.getRestaurantInsideFlag().booleanValue()) { // false (0): 내부 식당
            // 이 블록이 내부 식당에 대한 유효성 검사를 수행해야 함
            if (request.getZoneId() == null) {
                return ResponseEntity.badRequest().body("내부 식당의 경우 구역(ZONE_ID)은 필수입니다.");
            }
            if (request.getRestaurantLocation() == null || request.getRestaurantLocation().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("내부 식당의 상세 위치 (RESTAURANT_LOCATION)는 필수입니다.");
            }
            // 내부 식당일 경우 외부 식당 관련 필드에 데이터가 있으면 경고 또는 오류 처리 (선택 사항)
            if (request.getRestaurantAddr1() != null && !request.getRestaurantAddr1().trim().isEmpty() ||
                    request.getRestaurantAddr2() != null && !request.getRestaurantAddr2().trim().isEmpty() ||
                    request.getRestaurantTel() != null && !request.getRestaurantTel().trim().isEmpty() ||
                    request.getRestaurantOpenTime() != null && !request.getRestaurantOpenTime().trim().isEmpty() ||
                    request.getRestaurantLastOrder() != null && !request.getRestaurantLastOrder().trim().isEmpty() ||
                    request.getRestaurantBreakTime() != null && !request.getRestaurantBreakTime().trim().isEmpty() ||
                    request.getRestaurantRestDay() != null && !request.getRestaurantRestDay().trim().isEmpty()) {
                System.err.println("경고: 내부 식당 등록 시 외부 식당 관련 필드가 포함되어 있습니다. (데이터 불일치 가능성)");
            }

        } else { // true (1): 외부 식당
            // 이 블록이 외부 식당에 대한 유효성 검사를 수행해야 함
            if (request.getZoneId() != null) {
                System.err.println("경고: 외부 식당 등록 시 ZONE_ID가 포함되어 있습니다. (데이터 불일치 가능성)");
            }
            if (request.getRestaurantAddr1() == null || request.getRestaurantAddr1().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("외부 식당의 주소 (RESTAURANT_ADDR1)는 필수입니다.");
            }
            if (request.getRestaurantLocation() == null || request.getRestaurantLocation().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("외부 식당의 상세 위치 (RESTAURANT_LOCATION)는 필수입니다.");
            }
            if (request.getRestaurantTel() == null || request.getRestaurantTel().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("외부 식당의 전화번호 (RESTAURANT_TEL)는 필수입니다.");
            }
            if (request.getRestaurantOpenTime() == null || request.getRestaurantOpenTime().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("외부 식당의 오픈 시간 (RESTAURANT_OPEN_TIME)은 필수입니다.");
            }
            if (request.getRestaurantLastOrder() == null || request.getRestaurantLastOrder().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("외부 식당의 라스트 오더 시간 (RESTAURANT_LAST_ORDER)은 필수입니다.");
            }
        }
        // --- restaurantInsideFlag 논리 검사 종료 ---


        try {
            boolean success = addRestaurantService.registerRestaurant(request);
            if (success) {
                return ResponseEntity.status(HttpStatus.CREATED).body("식당 정보와 이미지가 성공적으로 등록되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("식당 등록에 실패했습니다. (DB 삽입 오류)");
            }
        } catch (IOException e) {
            System.err.println("식당 이미지 파일 처리 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("식당 이미지 파일 처리 중 오류가 발생했습니다: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("식당 등록 중 예상치 못한 서버 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("식당 등록 중 예상치 못한 오류가 발생했습니다: " + e.getMessage());
        }
    }
}