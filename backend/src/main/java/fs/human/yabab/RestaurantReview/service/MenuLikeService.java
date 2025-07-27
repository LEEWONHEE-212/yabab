package fs.human.yabab.RestaurantReview.service;

import fs.human.yabab.RestaurantReview.dao.MenuLikeDAO;
import fs.human.yabab.RestaurantReview.vo.MenuLikeRequestDTO;
import fs.human.yabab.RestaurantReview.vo.MenuLikeStatusDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MenuLikeService {
    private final MenuLikeDAO menuLikeDao;

    @Autowired
    public MenuLikeService(MenuLikeDAO menuLikeDao) {
        this.menuLikeDao = menuLikeDao;
    }

    /**
     * 특정 메뉴에 대한 좋아요 상태를 토글합니다.
     * 사용자가 이미 좋아요를 눌렀다면 좋아요를 취소하고, 누르지 않았다면 좋아요를 추가합니다.
     * 트랜잭션 처리를 통해 데이터 일관성을 보장합니다.
     *
     * @param menuId 메뉴의 고유 ID
     * @param userId 좋아요를 누르거나 취소할 사용자의 고유 ID
     * @return 변경된 좋아요 상태 및 총 좋아요 수를 포함하는 MenuLikeStatusDto
     * @throws IllegalArgumentException menuId 또는 userId가 유효하지 않을 경우
     * @throws RuntimeException 데이터베이스 작업 중 오류 발생 시
     */
    @Transactional
    public MenuLikeStatusDTO toggleMenuLike(Long menuId, String userId) {
        // 입력 값 유효성 검사
        if (menuId == null || userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("메뉴 ID와 사용자 ID는 필수 값입니다.");
        }

        MenuLikeRequestDTO menuLikeDto = new MenuLikeRequestDTO(menuId, userId);
        // 현재 사용자가 해당 메뉴에 좋아요를 눌렀는지 확인
        boolean isLiked = menuLikeDao.isMenuLikedByUser(menuId, userId) > 0;
        int rowsAffected;
        boolean newIsLikedStatus; // 좋아요 토글 후의 새로운 상태

        if (isLiked) {
            // 이미 좋아요를 눌렀다면 좋아요 취소 (삭제)
            rowsAffected = menuLikeDao.deleteMenuLike(menuLikeDto);
            newIsLikedStatus = false; // 새로운 상태는 '좋아요 취소됨'
            if (rowsAffected == 0) {
                // 삭제할 대상이 없었을 경우 (예: 동시성 문제로 이미 삭제되었을 때)
                System.err.println("메뉴 좋아요 삭제 실패: menuId=" + menuId + ", userId=" + userId + ". 영향을 받은 행 없음.");
                // 이 경우에도 실제 상태를 다시 확인하여 반환하는 것이 안전합니다.
                newIsLikedStatus = menuLikeDao.isMenuLikedByUser(menuId, userId) > 0;
            }
        } else {
            // 좋아요를 누르지 않았다면 좋아요 추가 (삽입)
            rowsAffected = menuLikeDao.insertMenuLike(menuLikeDto);
            newIsLikedStatus = true; // 새로운 상태는 '좋아요 눌림'
            if (rowsAffected == 0) {
                // 삽입 실패 (예: 유니크 제약 조건 위반 등, 이미 좋아요가 눌린 경우)
                System.err.println("메뉴 좋아요 삽입 실패: menuId=" + menuId + ", userId=" + userId + ". 영향을 받은 행 없음.");
                // 이 경우에도 실제 상태를 다시 확인하여 반환하는 것이 안전합니다.
                newIsLikedStatus = menuLikeDao.isMenuLikedByUser(menuId, userId) > 0;
            }
        }

        // 좋아요 토글 후 업데이트된 총 좋아요 수를 조회
        int updatedLikeCount = menuLikeDao.getMenuLikeCount(menuId);

        // 변경된 좋아요 상태와 총 좋아요 수를 담은 DTO 반환
        return new MenuLikeStatusDTO(menuId, userId, updatedLikeCount, newIsLikedStatus);
    }

    /**
     * 특정 메뉴의 현재 좋아요 상태와 총 좋아요 수를 조회합니다.
     * 로그인하지 않은 사용자도 호출할 수 있습니다.
     *
     * @param menuId 메뉴의 고유 ID
     * @param userId 사용자의 고유 ID (로그인하지 않은 경우 null 또는 빈 문자열 전달 가능)
     * @return MenuLikeStatusDto (총 좋아요 수, 사용자의 좋아요 여부)
     * @throws IllegalArgumentException menuId가 유효하지 않을 경우
     */
    public MenuLikeStatusDTO getMenuLikeStatus(Long menuId, String userId) {
        if (menuId == null) {
            throw new IllegalArgumentException("메뉴 ID는 필수 값입니다.");
        }

        // 해당 메뉴의 총 좋아요 수 조회
        int likeCount = menuLikeDao.getMenuLikeCount(menuId);
        // 현재 사용자가 좋아요를 눌렀는지 여부 확인 (userId가 유효한 경우에만)
        boolean isLikedByUser = false;
        if (userId != null && !userId.trim().isEmpty()) {
            isLikedByUser = menuLikeDao.isMenuLikedByUser(menuId, userId) > 0;
        }

        return new MenuLikeStatusDTO(menuId, userId, likeCount, isLikedByUser);
    }
}