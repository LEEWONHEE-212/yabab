package fs.human.yabab.MyPage.service; // MyPage 패키지 안에 Service를 두는 것으로 가정

import fs.human.yabab.MyPage.dao.MyPageAnnotaionDAO; // MyPageAnnotaionDAO import
import fs.human.yabab.MyPage.vo.MyPageAnnotaion; // MyPageAnnotaion DTO import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service // Spring Service Component
public class MyPageAnnotaionService { // Service 이름 MyPageAnnotaionService로 변경

    private final MyPageAnnotaionDAO myPageAnnotaionDAO; // DAO 필드명 변경

    @Autowired // Constructor Injection
    public MyPageAnnotaionService(MyPageAnnotaionDAO myPageAnnotaionDAO) {
        this.myPageAnnotaionDAO = myPageAnnotaionDAO;
    }

    /**
     * 특정 사용자가 작성한 모든 게시글(삭제되지 않은)을 조회합니다.
     * @param userId 게시글을 조회할 사용자의 ID
     * @return 해당 사용자의 게시글 목록 (MyPageAnnotaion DTO 리스트)
     */
    public List<MyPageAnnotaion> getUserPosts(String userId) {
        // MyPageAnnotaionDAO의 selectFeedsByUserId 메서드 호출
        return myPageAnnotaionDAO.selectFeedsByUserId(userId);
    }

    /**
     * 특정 게시글을 소프트 삭제합니다 (FEED_DELETED_FLAG를 1로 설정).
     * @param feedId 삭제할 게시글의 ID
     * @param userId 삭제를 요청한 사용자의 ID (updatedBy 필드에 사용)
     * @return 삭제 성공 여부 (true: 성공, false: 실패)
     */
    @Transactional // 데이터 변경 작업이므로 트랜잭션 처리
    public boolean deleteUserPost(Long feedId, String userId) {
        // MyPageAnnotaionDAO의 softDeleteFeed 메서드 호출
        // 삭제된 레코드 수를 반환받아 성공 여부 확인
        int deletedRows = myPageAnnotaionDAO.softDeleteFeed(feedId, userId);
        return deletedRows > 0; // 1개 이상 삭제되었으면 성공
    }

    /**
     * (선택적) 특정 게시글 ID로 단일 게시글 정보를 조회합니다.
     * @param feedId 조회할 게시글의 ID
     * @return 해당 게시글 정보 (MyPageAnnotaion DTO)
     */
    public MyPageAnnotaion getPostById(Long feedId) {
        // MyPageAnnotaionDAO의 selectFeedById 메서드 호출
        return myPageAnnotaionDAO.selectFeedById(feedId);
    }
}
