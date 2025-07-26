package fs.human.yabab.MyPage.service;

import fs.human.yabab.MyPage.dao.MyPageReservationDAO;
import fs.human.yabab.MyPage.vo.MyPageReservationDTO;
import fs.human.yabab.MyPage.vo.MyPageReviewDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MyPageReservationService {
    private final MyPageReservationDAO myPageReservationDAO;

    @Autowired
    public MyPageReservationService(MyPageReservationDAO myPageReservationDAO){
        this.myPageReservationDAO = myPageReservationDAO;
    }

    @Transactional(readOnly = true) // 읽기 전용 트랜잭션 설정 (데이터 변경 없음)
    public List<MyPageReservationDTO> getUserReservations(String userId) {
        // DAO를 통해 예약 내역 조회
        List<MyPageReservationDTO> reservations = myPageReservationDAO.getReservationsByUserId(userId);

        // 여기서는 DAO에서 이미 DTO 형태로 대부분의 데이터가 변환되어 오므로,
        // 특별한 추가 비즈니스 로직이나 복잡한 데이터 가공은 필요 없을 수 있습니다.
        // 예를 들어, 예약 상태 코드(0,1,2)를 문자열로 변환하는 로직을 DAO XML에서 처리했지만,
        // 필요하다면 여기서도 처리할 수 있습니다.

        // 예약 내역이 없으면 빈 리스트 반환
        if (reservations.isEmpty()) {
            // 로깅 등 추가 작업
            System.out.println("No reservations found for user: " + userId);
        }

        return reservations;
    }

    @Transactional(readOnly = true) // 읽기 전용 트랜잭션 설정
    public List<MyPageReviewDTO> getUserReviews(String userId) {
        // DAO를 통해 리뷰 리스트 조회
        List<MyPageReviewDTO> reviews = myPageReservationDAO.getReviewsByUserId(userId);

        // ★ 리뷰 이미지 URL 가공 (SQL에서 처리하지 않았다면 여기서 처리) ★
        // XML에서 FULL_IMAGE_URL을 만들었다면 이 로직은 불필요합니다.
        // 하지만 더 유연하게 이미지 서버 경로를 관리하려면 여기서 처리하는 것이 좋습니다.
        // 예:
        /*
        String imageBaseUrl = "http://your.image.server.com/images"; // 실제 이미지 서버 URL prefix
        for (MyPageReviewDTO review : reviews) {
            // DB에서 REVIEW_IMAGE_PATH와 REVIEW_IMAGE_NAME을 가져왔다고 가정하고
            // DTO에 이 필드들이 있다고 가정하면 (지금은 MyPageReviewDTO에 없음)
            // 이를 조합하여 reviewImageUrl을 설정할 수 있습니다.
            // 현재 DTO는 이미 reviewImageUrl을 포함하므로, DAO XML에서 FULL_IMAGE_URL을 생성하거나
            // REVIEW_IMAGE_PATH와 REVIEW_IMAGE_NAME을 DTO에 추가하여 여기서 조합하는 방식 중 하나를 선택합니다.
            // 현재 XML에서 FULL_IMAGE_URL을 생성했으므로 이 부분은 필요 없을 가능성이 높습니다.
            // 만약 리뷰 이미지가 존재한다면, ReviewDto의 reviewImageUrl 필드가 제대로 채워져 있는지 확인 필요.
            // String imagePath = review.getReviewImagePath(); // DTO에 해당 필드 추가 시
            // String imageName = review.getReviewImageName(); // DTO에 해당 필드 추가 시
            // if (imagePath != null && imageName != null) {
            //     review.setReviewImageUrl(imageBaseUrl + imagePath + "/" + imageName);
            // }
        }
        */

        // 좋아요/댓글 수가 DB에 없어 XML에서 0으로 설정했지만,
        // 만약 추후 관련 테이블이 생긴다면 여기서 해당 정보를 집계하여 DTO에 추가할 수 있습니다.

        if (reviews.isEmpty()) {
            System.out.println("No reviews found for user: " + userId);
        }

        return reviews;
    }

    /**
     * 특정 예약 내역을 삭제합니다.
     * @param reservationId 삭제할 예약 ID
     * @param userId        예약 소유자 ID (보안을 위해 확인)
     * @return 삭제 성공 여부 (true: 성공, false: 실패)
     */
    @Transactional // 데이터 변경이 있으므로 트랜잭션 설정
    public boolean deleteReservation(Long reservationId, String userId) {
        // DAO를 통해 예약 삭제
        int deletedRows = myPageReservationDAO.deleteReservation(reservationId, userId);
        return deletedRows > 0; // 삭제된 레코드가 1개 이상이면 성공
    }

    /**
     * 특정 리뷰를 삭제합니다.
     * @param reviewId 삭제할 리뷰 ID
     * @param userId   리뷰 작성자 ID (보안을 위해 확인)
     * @return 삭제 성공 여부 (true: 성공, false: 실패)
     */
    @Transactional // 데이터 변경이 있으므로 트랜잭션 설정
    public boolean deleteReview(Long reviewId, String userId) {
        // DAO를 통해 리뷰 삭제 (소프트 삭제)
        int updatedRows = myPageReservationDAO.deleteReview(reviewId, userId);
        return updatedRows > 0; // 업데이트된 레코드가 1개 이상이면 성공
    }
}
