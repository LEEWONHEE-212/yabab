// src/main/java/fs/human/yabab/Admin/dao/AdminUserDAO.java

package fs.human.yabab.Admin.dao;

import fs.human.yabab.Admin.vo.AdminUserDTO;
import fs.human.yabab.Admin.vo.AdminUserSearchRequestDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper // MyBatis Mapper 인터페이스임을 선언
public interface AdminUserDAO {

    /**
     * 관리자 페이지에서 회원 목록을 검색 및 페이징하여 조회합니다.
     * USER_DELETED_FLAG가 0인(활동 중인) 회원만 조회합니다.
     *
     * @param searchRequest 검색 조건 및 페이징 정보 (searchType, searchTerm, userRole, page, size, sortBy, sortDirection)
     * @return 검색 조건에 맞는 회원 목록 (AdminUserDTO 리스트)
     */
    List<AdminUserDTO> selectUsersBySearchAndPaging(AdminUserSearchRequestDTO searchRequest);

    /**
     * 관리자 페이지에서 검색 조건에 맞는 전체 회원 수를 조회합니다.
     * 페이징 처리를 위한 총 레코드 수를 얻기 위해 사용됩니다.
     * USER_DELETED_FLAG가 0인(활동 중인) 회원만 카운트합니다.
     *
     * @param searchRequest 검색 조건 (searchType, searchTerm, userRole)
     * @return 검색 조건에 맞는 전체 회원 수
     */
    int countUsersBySearch(AdminUserSearchRequestDTO searchRequest);

    /**
     * 특정 회원의 USER_DELETED_FLAG를 1로 업데이트하여 논리적으로 삭제(비활성화)합니다.
     *
     * @param userId 삭제할 회원의 ID
     * @return 업데이트된 레코드 수 (성공 시 1)
     */
    int updateUserDeletedFlag(@Param("userId") String userId);

    /**
     * (선택적) 특정 회원의 상세 정보를 조회합니다.
     * AdminUserDTO가 목록에 필요한 최소 정보만 담고 있다면, 상세 조회를 위한 DTO를 별도로 만들거나
     * AdminUserDTO에 추가 필드를 정의한 후 이 메서드를 사용할 수 있습니다.
     * 현재 AdminUserDTO는 목록에 필요한 정보만 가지고 있습니다.
     *
     * @param userId 조회할 회원의 ID
     * @return 해당 회원의 상세 정보 (AdminUserDTO)
     */
    AdminUserDTO selectUserById(@Param("userId") String userId);

    /**
     * 특정 회원의 정보를 데이터베이스에서 물리적으로 삭제합니다.
     *
     * @param userId 삭제할 회원의 ID
     * @return 삭제된 레코드 수 (성공 시 1)
     */
    int deleteUser(@Param("userId") String userId);

    // ⭐ New methods for hard deleting user-related data (child records) ⭐

    /**
     * Deletes all comment like records associated with a specific user.
     * @param userId The ID of the user whose comment likes will be deleted.
     * @return The number of deleted records.
     */
    int deleteCommentLikesByUserId(@Param("userId") String userId);

    /**
     * Deletes all feed like records associated with a specific user.
     * @param userId The ID of the user whose feed likes will be deleted.
     * @return The number of deleted records.
     */
    int deleteFeedLikesByUserId(@Param("userId") String userId);

    /**
     * Deletes all reservation records associated with a specific user.
     * @param userId The ID of the user whose reservations will be deleted.
     * @return The number of deleted records.
     */
    int deleteReservationsByUserId(@Param("userId") String userId);

    /**
     * Deletes all feed comments written by a specific user.
     * @param userId The ID of the user whose comments will be deleted.
     * @return The number of deleted records.
     */
    int deleteFeedCommentsByUserId(@Param("userId") String userId);

    /**
     * Deletes all feed posts written by a specific user.
     * Note: This only deletes the feed entries themselves. Related comments and likes for these feeds
     * must be handled separately (e.g., by cascading deletes in DB or by calling other DAO methods).
     * @param userId The ID of the user whose feeds will be deleted.
     * @return The number of deleted records.
     */
    int deleteFeedsByUserId(@Param("userId") String userId);

    /**
     * Deletes all restaurant records owned by a specific user (if the user is an owner).
     * Note: This only deletes the restaurant entries themselves. Related menus, reservations for these restaurants
     * must be handled separately (e.g., by cascading deletes in DB or by calling other DAO methods).
     * @param userId The ID of the owner whose restaurants will be deleted.
     * @return The number of deleted records.
     */
    int deleteRestaurantsByOwnerId(@Param("userId") String userId);
}
