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
     *
     * @param userId 삭제할 회원의 ID
     * @return 삭제 성공 여부 (true: 성공, false: 실패)
     */
    @Transactional // 데이터 변경 작업을 위해 트랜잭션 처리
    public boolean deleteUser(String userId) { // 메서드 이름 변경
        int deletedRows = adminUserDAO.deleteUser(userId); // DAO 메서드 호출 변경
        return deletedRows > 0; // 1개 이상의 레코드가 삭제되면 성공
    }

    public AdminUserDTO getUserById(String userId) {
        return adminUserDAO.selectUserById(userId);
    }
}