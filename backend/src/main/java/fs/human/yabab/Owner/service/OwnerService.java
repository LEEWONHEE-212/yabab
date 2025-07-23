package fs.human.yabab.Owner.service;

import fs.human.yabab.Owner.dao.OwnerDAO;
import fs.human.yabab.Owner.vo.Owner_MenuDTO;
import fs.human.yabab.Owner.vo.OwnerDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OwnerService {
    private final OwnerDAO ownerDAO;

    @Autowired
    public OwnerService(OwnerDAO ownerDAO){
        this.ownerDAO = ownerDAO;
    }

    /**
     * 특정 소유자 ID로 식당 정보를 조회합니다.
     * @param ownerId 소유자 ID
     * @return 식당 정보 (OwnerDTO)
     */
    @Transactional(readOnly = true)
    public OwnerDTO getRestaurantByOwnerId(String ownerId){
        return ownerDAO.findRestaurantByOwnerId(ownerId);
    }

    /**
     * 특정 restaurantId로 식당 상세 정보를 조회합니다.
     * 컨트롤러의 GET /{restaurantId} 엔드포인트와 updateRestaurant 로직에서 사용됩니다.
     * @param restaurantId 조회할 식당의 ID
     * @return 식당 상세 정보 (OwnerDTO)
     * @throws IllegalArgumentException 식당 ID가 제공되지 않았을 경우
     */
    @Transactional(readOnly = true)
    public OwnerDTO getRestaurantDetailsById(Long restaurantId) {
        if (restaurantId == null) {
            throw new IllegalArgumentException("조회할 식당의 ID가 제공되지 않았습니다.");
        }
        return ownerDAO.findRestaurantById(restaurantId);
    }

    /**
     * 모든 구장의 이름과 ID 목록을 조회합니다.
     * @return 구장 목록 (List<OwnerDTO>)
     */
    @Transactional(readOnly = true)
    public List<OwnerDTO> getAllStadiums() {
        return ownerDAO.selectAllStadiumNamesAndIds();
    }

    /**
     * 특정 구장 ID에 해당하는 구역 목록을 조회합니다.
     * @param stadiumId 구장 ID
     * @return 구역 목록 (List<OwnerDTO>)
     */
    @Transactional(readOnly = true)
    public List<OwnerDTO> getZonesForStadium(Long stadiumId) {
        if (stadiumId == null) {
            return new ArrayList<>();
        }
        return ownerDAO.getZonesByStadiumId(stadiumId);
    }

    /**
     * 식당 정보를 업데이트합니다. 이미지 파일 처리 로직을 포함합니다.
     * @param ownerDTO 업데이트할 식당 정보가 담긴 DTO
     * @return 업데이트된 식당의 최신 정보 (OwnerDTO)
     * @throws IllegalArgumentException 업데이트할 식당의 ID가 제공되지 않았을 경우
     * @throws RuntimeException 식당을 찾을 수 없거나 업데이트에 실패했을 경우
     */
    @Transactional // 데이터 변경 작업이므로 트랜잭션 처리
    public OwnerDTO updateRestaurant(OwnerDTO ownerDTO) {
        // 1. DTO에 ID가 반드시 있어야 함을 확인
        if (ownerDTO.getId() == null) {
            throw new IllegalArgumentException("업데이트할 식당의 ID가 제공되지 않았습니다.");
        }

        // 2. 기존 식당 정보 조회 (새 이미지가 없을 경우 기존 이미지 경로 및 이름 유지를 위해)
        OwnerDTO existingRestaurant = ownerDAO.findRestaurantById(ownerDTO.getId());
        if (existingRestaurant == null) {
            throw new RuntimeException("ID " + ownerDTO.getId() + "에 해당하는 식당을 찾을 수 없습니다.");
        }

        // 3. 이미지 경로 및 이름 처리:
        //    새로운 이미지 파일이 업로드되지 않았다면 (ownerDTO.getRestaurantImageName()이 null이거나 비어있다면),
        //    기존 이미지 경로와 이름을 유지하도록 ownerDTO에 설정합니다.
        //    컨트롤러에서 MultipartFile이 null일 때 ownerDTO.setRestaurantImagePath() 및 setRestaurantImageName()을 호출하지 않았을 경우를 대비합니다.
        if (ownerDTO.getRestaurantImageName() == null || ownerDTO.getRestaurantImageName().isEmpty()) {
            ownerDTO.setRestaurantImagePath(existingRestaurant.getRestaurantImagePath());
            ownerDTO.setRestaurantImageName(existingRestaurant.getRestaurantImageName());
        }
        // 참고: 새로운 이미지가 업로드된 경우, 컨트롤러에서 이미 ownerDTO의 restaurantImagePath와 restaurantImageName을
        // 새로운 값으로 설정했으므로, 이 'if' 조건은 false가 되어 새로운 이미지 정보가 사용됩니다.

        // 4. OwnerDAO를 통해 데이터베이스 업데이트 수행
        int result = ownerDAO.updateRestaurant(ownerDTO);

        if (result == 0) {
            // 업데이트된 레코드가 없다면 (예: restaurantId가 존재하지 않음) 예외를 던집니다.
            throw new RuntimeException("식당 정보를 업데이트하는 데 실패했습니다. ID를 확인하세요: " + ownerDTO.getId());
        }

        // 5. 업데이트가 성공했다면, 다시 DB에서 최신 정보를 조회하여 반환합니다.
        //    이것이 프론트엔드에 가장 정확하고 최신 상태의 데이터를 전달하는 방법입니다.
        return ownerDAO.findRestaurantById(ownerDTO.getId());
    }

    // ----------------------------------------------------
    // 메뉴 관련 서비스 메서드 추가
    // ----------------------------------------------------

    /**
     * 특정 식당의 모든 메뉴 항목을 조회합니다.
     * @param restaurantId 메뉴를 조회할 식당의 ID
     * @return 해당 식당의 메뉴 목록
     * @throws IllegalArgumentException 식당 ID가 유효하지 않을 경우
     */
    @Transactional(readOnly = true)
    public List<Owner_MenuDTO> getMenusByRestaurantId(Long restaurantId) {
        if (restaurantId == null || restaurantId <= 0) {
            throw new IllegalArgumentException("유효한 식당 ID가 제공되어야 합니다.");
        }
        return ownerDAO.findMenusByRestaurantId(restaurantId);
    }

    /**
     * 새로운 메뉴 항목을 추가합니다.
     * @param ownerMenuDTO 추가할 메뉴의 정보 (restaurantId, menuName, menuPrice 포함)
     * @param creatorId 메뉴를 생성하는 사용자 ID (예: 로그인한 사장님 ID)
     * @return 추가된 메뉴의 DTO (ID가 포함될 수 있음)
     * @throws IllegalArgumentException 필수 정보가 누락되었거나 식당 ID가 유효하지 않을 경우
     * @throws RuntimeException 메뉴 추가에 실패했을 경우
     */
    @Transactional
    public Owner_MenuDTO addMenu(Owner_MenuDTO ownerMenuDTO, String creatorId) {
        if (ownerMenuDTO == null || ownerMenuDTO.getRestaurantId() == null || ownerMenuDTO.getRestaurantId() <= 0 ||
                ownerMenuDTO.getMenuName() == null || ownerMenuDTO.getMenuName().isEmpty() ||
                ownerMenuDTO.getMenuPrice() == null) {
            throw new IllegalArgumentException("메뉴 추가에 필요한 모든 정보(식당ID, 메뉴이름, 가격)를 제공해야 합니다.");
        }

        // 생성자 정보 설정
        ownerMenuDTO.setCreatedBy(creatorId != null && !creatorId.isEmpty() ? creatorId : "UNKNOWN_OWNER");
        // 업데이트 정보는 생성 시점에는 설정하지 않거나, 생성자와 동일하게 설정할 수 있습니다.
        // menuDTO.setUpdatedBy(creatorId);

        int result = ownerDAO.insertMenu(ownerMenuDTO);
        if (result == 0) {
            throw new RuntimeException("메뉴 추가에 실패했습니다.");
        }
        // Mybatis insert 후 keyProperty로 설정된 menuId가 DTO에 자동으로 채워집니다.
        return ownerMenuDTO;
    }

    /**
     * 기존 메뉴 항목을 업데이트합니다.
     * @param ownerMenuDTO 업데이트할 메뉴의 정보 (menuId, menuName, menuPrice 포함)
     * @param updaterId 메뉴를 업데이트하는 사용자 ID (예: 로그인한 사장님 ID)
     * @return 업데이트된 메뉴의 DTO
     * @throws IllegalArgumentException 필수 정보가 누락되었거나 메뉴 ID가 유효하지 않을 경우
     * @throws RuntimeException 메뉴 업데이트에 실패했을 경우
     */
    @Transactional
    public Owner_MenuDTO updateMenu(Owner_MenuDTO ownerMenuDTO, String updaterId) {
        if (ownerMenuDTO == null || ownerMenuDTO.getMenuId() == null || ownerMenuDTO.getMenuId() <= 0 ||
                ownerMenuDTO.getMenuName() == null || ownerMenuDTO.getMenuName().isEmpty() ||
                ownerMenuDTO.getMenuPrice() == null) {
            throw new IllegalArgumentException("메뉴 업데이트에 필요한 모든 정보(메뉴ID, 메뉴이름, 가격)를 제공해야 합니다.");
        }

        // 업데이트 전에 기존 메뉴가 존재하는지 확인 (선택 사항이지만 안정성 높임)
        Owner_MenuDTO existingMenu = ownerDAO.findMenuById(ownerMenuDTO.getMenuId());
        if (existingMenu == null) {
            throw new RuntimeException("ID " + ownerMenuDTO.getMenuId() + "에 해당하는 메뉴를 찾을 수 없습니다.");
        }

        // 업데이트자 정보 설정
        ownerMenuDTO.setUpdatedBy(updaterId != null && !updaterId.isEmpty() ? updaterId : "UNKNOWN_OWNER");

        int result = ownerDAO.updateMenu(ownerMenuDTO);
        if (result == 0) {
            throw new RuntimeException("메뉴 업데이트에 실패했습니다. 메뉴 ID를 확인하세요: " + ownerMenuDTO.getMenuId());
        }

        // 업데이트된 메뉴의 최신 정보를 다시 조회하여 반환
        return ownerDAO.findMenuById(ownerMenuDTO.getMenuId());
    }

    /**
     * 특정 메뉴 항목을 삭제합니다.
     * @param menuId 삭제할 메뉴의 ID
     * @return 삭제 성공 여부 (true/false)
     * @throws IllegalArgumentException 메뉴 ID가 유효하지 않을 경우
     * @throws RuntimeException 메뉴 삭제에 실패했을 경우
     */
    @Transactional
    public boolean deleteMenu(Long menuId) {
        if (menuId == null || menuId <= 0) {
            throw new IllegalArgumentException("유효한 메뉴 ID가 제공되어야 합니다.");
        }

        // 삭제 전에 메뉴가 존재하는지 확인 (선택 사항이지만 안정성 높임)
        Owner_MenuDTO existingMenu = ownerDAO.findMenuById(menuId);
        if (existingMenu == null) {
            // 이미 존재하지 않는 메뉴를 삭제하려는 경우, 성공으로 처리하거나 예외를 던질 수 있습니다.
            // 여기서는 이미 삭제되었다고 가정하고 true 반환합니다. 필요에 따라 변경 가능.
            // throw new RuntimeException("ID " + menuId + "에 해당하는 메뉴를 찾을 수 없습니다.");
            return true; // 또는 false, API 정책에 따라 다름. 여기서는 "결과적으로 삭제된 상태"로 간주.
        }

        int result = ownerDAO.deleteMenu(menuId);
        if (result == 0) {
            throw new RuntimeException("메뉴 삭제에 실패했습니다. 메뉴 ID를 확인하세요: " + menuId);
        }
        return true;
    }
}