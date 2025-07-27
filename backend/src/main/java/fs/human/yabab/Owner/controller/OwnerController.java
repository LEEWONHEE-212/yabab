package fs.human.yabab.Owner.controller;

import fs.human.yabab.Owner.vo.OwnerDTO;
import fs.human.yabab.Owner.vo.Owner_MenuDTO;
import fs.human.yabab.Owner.service.OwnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/owner/restaurants") //
@CrossOrigin(origins = "http://localhost:3000")
public class OwnerController {
    private final OwnerService ownerService;

    @Value("${upload.uploads.image.dir}")
    private String fileSystemUploadDir;

    @Autowired
    public OwnerController(OwnerService ownerService){
        this.ownerService = ownerService;
    }

    /**
     * 특정 소유자 ID로 식당 정보를 조회합니다.
     * @param ownerId 소유자 ID
     * @return 식당 정보 (OwnerDTO) 또는 404 Not Found
     */
    @GetMapping("/{ownerId}") // <--- 경로에서 "/owner"를 제거합니다.
    public ResponseEntity<OwnerDTO> getRestaurantByOwnerId(@PathVariable String ownerId) {
        OwnerDTO restaurant = ownerService.getRestaurantByOwnerId(ownerId);

        if(restaurant != null){
            return ResponseEntity.ok(restaurant);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * 특정 restaurantId로 식당 상세 정보를 조회합니다.
     * 이 엔드포인트는 식당 수정 페이지에서 기존 데이터를 불러올 때 사용됩니다.
     * @param restaurantId 조회할 식당의 ID
     * @return 식당 상세 정보 (OwnerDTO)
     */
    @GetMapping("/details/{restaurantId}") // <--- 경로를 명확하게 변경합니다.
    public ResponseEntity<OwnerDTO> getRestaurantDetailsById(@PathVariable Long restaurantId) {
        try {
            OwnerDTO restaurant = ownerService.getRestaurantDetailsById(restaurantId);
            if (restaurant != null) {
                return ResponseEntity.ok(restaurant);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("식당 상세 정보 조회 중 서버 오류 발생 (restaurantId: " + restaurantId + "): " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "식당 상세 정보를 불러오는데 실패했습니다.", e);
        }
    }

    /**
     * 모든 구장의 이름과 ID 목록을 조회합니다.
     * @return 구장 목록 (List<OwnerDTO>)
     */
    @GetMapping("/stadiums/names-ids") // <--- 경로에서 "/owner"를 제거합니다.
    public ResponseEntity<List<OwnerDTO>> getStadiumNamesAndIds() {
        try {
            List<OwnerDTO> stadiums = ownerService.getAllStadiums();
            return ResponseEntity.ok(stadiums);
        } catch (Exception e) {
            System.err.println("구장 목록 조회 중 서버 오류 발생: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "구장 목록을 불러오는데 실패했습니다.", e);
        }
    }

    /**
     * 특정 구장 ID에 해당하는 구역 목록을 조회합니다.
     * @param stadiumId 구장 ID
     * @return 구역 목록 (List<OwnerDTO>)
     */
    @GetMapping("/stadiums/{stadiumId}/zones") // <--- 경로에서 "/owner"를 제거합니다.
    public ResponseEntity<List<OwnerDTO>> getZonesByStadiumId(@PathVariable Long stadiumId) {
        try {
            if (stadiumId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "stadiumId는 필수입니다.");
            }
            List<OwnerDTO> zones = ownerService.getZonesForStadium(stadiumId);
            return ResponseEntity.ok(zones);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("구역 목록 조회 중 서버 오류 발생 (stadiumId: " + stadiumId + "): " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "구역 목록을 불러오는데 실패했습니다.", e);
        }
    }

    /**
     * 식당 정보를 업데이트합니다. 이미지 파일 업로드도 처리합니다.
     * @param restaurantId URL 경로에서 받은 식당 ID
     * @param ownerDTO 폼 데이터로 받은 식당 정보 DTO
     * @param restaurantImage 업로드된 이미지 파일 (선택 사항)
     * @return 업데이트된 식당 정보 (OwnerDTO) 또는 오류 메시지
     */
    @PutMapping("/{restaurantId}") // <--- 경로에서 "/owner"를 제거합니다.
    public ResponseEntity<OwnerDTO> updateRestaurant(
            @PathVariable Long restaurantId,
            @ModelAttribute OwnerDTO ownerDTO,
            @RequestParam(value = "restaurantImage", required = false) MultipartFile restaurantImage
    ) {
        ownerDTO.setId(restaurantId);

        if (restaurantImage != null && !restaurantImage.isEmpty()) {
            try {
                // WebConfig에 설정된 실제 파일 시스템 경로를 @Value로 주입받아 사용
                Path uploadPath = Paths.get(fileSystemUploadDir).toAbsolutePath().normalize();
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String originalFilename = restaurantImage.getOriginalFilename();
                String fileExtension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String fileName = UUID.randomUUID().toString() + fileExtension;

                Path filePath = uploadPath.resolve(fileName).normalize();
                Files.copy(restaurantImage.getInputStream(), filePath);

                // WebConfig의 addResourceHandler("/restaurant-images/**")와 일치하는 웹 접근 경로
                String webAccessPathPrefix = "/uploads/";

                // DTO에 웹 접근 경로와 파일 이름 설정
                // restaurantImagePath에 웹 접근 경로 + 파일명을 저장하여 DB 스크린샷과 일치시킴
                ownerDTO.setRestaurantImagePath(webAccessPathPrefix + fileName);
                ownerDTO.setRestaurantImageName(fileName);

            } catch (IOException e) {
                e.printStackTrace();
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 저장 실패: " + e.getMessage(), e);
            }
        }

        try {
            OwnerDTO updatedRestaurant = ownerService.updateRestaurant(ownerDTO);
            return ResponseEntity.ok(updatedRestaurant);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "식당 정보 수정 중 오류가 발생했습니다.", e);
        }
    }

    // ----------------------------------------------------
    // 메뉴 관련 API 엔드포인트 추가
    // ----------------------------------------------------

    /**
     * 특정 식당의 메뉴 목록을 조회합니다.
     * GET /api/owner/restaurants/{restaurantId}/menus
     * @param restaurantId 메뉴를 조회할 식당의 ID
     * @return 메뉴 목록 (List<MenuDTO>)
     */
    @GetMapping("/{restaurantId}/menus")
    public ResponseEntity<List<Owner_MenuDTO>> getRestaurantMenus(@PathVariable Long restaurantId) {
        try {
            List<Owner_MenuDTO> menus = ownerService.getMenusByRestaurantId(restaurantId);
            return ResponseEntity.ok(menus);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("메뉴 목록 조회 중 서버 오류 발생 (restaurantId: " + restaurantId + "): " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "메뉴 목록을 불러오는데 실패했습니다.", e);
        }
    }

    /**
     * 특정 식당에 새로운 메뉴를 추가합니다.
     * POST /api/owner/restaurants/{restaurantId}/menus
     * @param restaurantId 메뉴를 추가할 식당의 ID
     * @param ownerMenuDTO 추가할 메뉴 정보
     * @param ownerId 메뉴를 추가하는 소유자 ID (createdBy 필드에 사용)
     * @return 추가된 메뉴 정보 (MenuDTO)
     */
    @PostMapping("/{restaurantId}/menus")
    public ResponseEntity<Owner_MenuDTO> addMenuToRestaurant(
            @PathVariable Long restaurantId,
            @RequestBody Owner_MenuDTO ownerMenuDTO,
            // @AuthenticationPrincipal UserDetails userDetails // 실제 사용 시 Spring Security와 연동하여 사용자 ID 가져옴
            @RequestParam(value = "ownerId", required = false) String ownerId // 임시 방편으로 ownerId를 쿼리 파라미터로 받음
    ) {
        ownerMenuDTO.setRestaurantId(restaurantId); // URL 경로의 restaurantId를 DTO에 설정
        String creatorId = (ownerId != null && !ownerId.isEmpty()) ? ownerId : "UNKNOWN_OWNER"; // 실제 사용자 ID로 대체 필요

        try {
            Owner_MenuDTO addedMenu = ownerService.addMenu(ownerMenuDTO, creatorId);
            return ResponseEntity.status(HttpStatus.CREATED).body(addedMenu);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "메뉴 추가에 실패했습니다: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("메뉴 추가 중 서버 오류 발생 (restaurantId: " + restaurantId + "): " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "메뉴 추가 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 특정 메뉴의 정보를 업데이트합니다.
     * PUT /api/owner/restaurants/menus/{menuId}
     * @param menuId 업데이트할 메뉴의 ID
     * @param ownerMenuDTO 업데이트할 메뉴 정보
     * @param ownerId 메뉴를 업데이트하는 소유자 ID (updatedBy 필드에 사용)
     * @return 업데이트된 메뉴 정보 (MenuDTO)
     */
    @PutMapping("/menus/{menuId}")
    public ResponseEntity<Owner_MenuDTO> updateRestaurantMenu(
            @PathVariable Long menuId,
            @RequestBody Owner_MenuDTO ownerMenuDTO,
            // @AuthenticationPrincipal UserDetails userDetails // 실제 사용 시 Spring Security와 연동하여 사용자 ID 가져옴
            @RequestParam(value = "ownerId", required = false) String ownerId // 임시 방편으로 ownerId를 쿼리 파라미터로 받음
    ) {
        ownerMenuDTO.setMenuId(menuId); // URL 경로의 menuId를 DTO에 설정
        String updaterId = (ownerId != null && !ownerId.isEmpty()) ? ownerId : "UNKNOWN_OWNER"; // 실제 사용자 ID로 대체 필요

        try {
            Owner_MenuDTO updatedMenu = ownerService.updateMenu(ownerMenuDTO, updaterId);
            return ResponseEntity.ok(updatedMenu);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e); // 메뉴를 찾을 수 없을 때 404
        } catch (Exception e) {
            System.err.println("메뉴 업데이트 중 서버 오류 발생 (menuId: " + menuId + "): " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "메뉴 업데이트 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 특정 메뉴를 삭제합니다.
     * DELETE /api/owner/restaurants/menus/{menuId}
     * @param menuId 삭제할 메뉴의 ID
     * @return 삭제 성공 여부 (HTTP 204 No Content)
     */
    @DeleteMapping("/menus/{menuId}")
    public ResponseEntity<Void> deleteRestaurantMenu(@PathVariable Long menuId) {
        try {
            ownerService.deleteMenu(menuId);
            return ResponseEntity.noContent().build(); // 삭제 성공 시 204 No Content
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e); // 메뉴를 찾을 수 없을 때 404
        } catch (Exception e) {
            System.err.println("메뉴 삭제 중 서버 오류 발생 (menuId: " + menuId + "): " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "메뉴 삭제 중 오류가 발생했습니다.", e);
        }
    }
}