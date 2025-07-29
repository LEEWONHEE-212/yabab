// src/main/java/fs/human/yabab/Admin/service/AdminUserServiceImpl.java

package fs.human.yabab.Admin.service;

import fs.human.yabab.Admin.dao.AdminUserDAO;
import fs.human.yabab.Admin.vo.AdminPageResponseDTO;
import fs.human.yabab.Admin.vo.AdminUserDTO;
import fs.human.yabab.Admin.vo.AdminUserSearchRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final AdminUserDAO adminUserDAO;

    public AdminPageResponseDTO<AdminUserDTO> getPagedUsers(AdminUserSearchRequestDTO searchRequest) {
        int totalElements = adminUserDAO.countUsersBySearch(searchRequest);
        int totalPages = (int) Math.ceil((double) totalElements / searchRequest.getSize());

        int requestedPage = searchRequest.getPage();
        if (requestedPage >= totalPages && totalPages > 0) {
            requestedPage = totalPages - 1;
            searchRequest.setPage(requestedPage);
        } else if (totalPages == 0) {
            requestedPage = 0;
            searchRequest.setPage(requestedPage);
        }

        List<AdminUserDTO> content = adminUserDAO.selectUsersBySearchAndPaging(searchRequest);

        return new AdminPageResponseDTO<>(
                content,
                requestedPage,
                searchRequest.getSize(),
                totalElements,
                totalPages,
                requestedPage == totalPages - 1,
                requestedPage == 0
        );
    }

    /**
     * 특정 회원의 정보를 데이터베이스에서 물리적으로 삭제합니다.
     * 이 메서드는 외래 키 제약 조건 위반을 방지하기 위해
     * 사용자와 관련된 모든 자식 레코드들을 먼저 삭제합니다.
     *
     * @param userId 삭제할 회원의 ID
     * @return 삭제 성공 여부 (true: 성공, false: 실패)
     */
    @Transactional // 모든 삭제 작업을 하나의 트랜잭션으로 묶도록 설정
    public boolean deleteUser(String userId) { // 기존 deleteUser 메서드를 물리적 삭제 로직으로 변경
        try {
            // 중요: 외래 키 제약 조건에 따라 자식 테이블부터 부모 테이블 순으로 삭제해야 합니다.
            // 순서는 데이터베이스 스키마와 외래 키 설정에 따라 달라질 수 있습니다.

            // 1. 사용자가 누른 댓글 좋아요 기록 삭제 (TB_COMMENT_LIKE)
            adminUserDAO.deleteCommentLikesByUserId(userId);

            // 2. 사용자가 누른 피드 좋아요 기록 삭제 (TB_FEED_LIKE)
            adminUserDAO.deleteFeedLikesByUserId(userId);

            // 3. 사용자의 예약 기록 삭제 (TB_RESERVATION)
            adminUserDAO.deleteReservationsByUserId(userId);

            // 4. 사용자가 작성한 댓글 물리적 삭제 (TB_FEED_COMMENT)
            // (참고: TB_FEED_COMMENT 삭제 시 TB_COMMENT_LIKE도 연쇄 삭제되도록 DB 제약조건이 설정되어 있다면
            // 1번 deleteCommentLikesByUserId는 불필요할 수 있지만, 안전을 위해 유지합니다.)
            adminUserDAO.deleteFeedCommentsByUserId(userId);

            // 5. 사용자가 작성한 피드 물리적 삭제 (TB_FEED)
            // (참고: TB_FEED 삭제 시 TB_FEED_COMMENT와 TB_FEED_LIKE도 연쇄 삭제되도록 DB 제약조건이 설정되어 있다면
            // 1, 2, 4번은 불필요할 수 있지만, 안전을 위해 유지합니다. 일반적으로는 CASCADE 설정을 추천합니다.)
            adminUserDAO.deleteFeedsByUserId(userId);

            // 6. 사용자가 소유한 식당 삭제 (TB_RESTAURANT - 사장님 계정일 경우)
            // (참고: TB_RESTAURANT 삭제 시 TB_MENU, TB_RESERVATION 등 관련 종속 테이블도 연쇄 삭제되도록
            // DB 제약조건이 설정되어 있다면 해당 테이블에 대한 개별 삭제는 불필요할 수 있습니다.)
            adminUserDAO.deleteRestaurantsByOwnerId(userId);

            // 7. 최종적으로 사용자 계정 물리적 삭제 (TB_USER)
            int deletedRows = adminUserDAO.deleteUser(userId);

            return deletedRows > 0; // 1개 이상의 레코드가 삭제되면 성공
        } catch (Exception e) {
            System.err.println("사용자 및 관련 데이터 물리적 삭제 중 오류 발생 (userId: " + userId + "): " + e.getMessage());
            e.printStackTrace();
            // 트랜잭션 롤백을 위해 RuntimeException을 던집니다.
            throw new RuntimeException("사용자 및 관련 데이터 삭제 실패: " + e.getMessage(), e);
        }
    }

    public AdminUserDTO getUserById(String userId) {
        return adminUserDAO.selectUserById(userId);
    }
}
