package fs.human.yabab.RestaurantReview.dao;

import fs.human.yabab.RestaurantReview.vo.RestaurantReviewDTO;
import fs.human.yabab.RestaurantReview.vo.ReviewDetailDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RestaurantReviewDAO {
    /**
     * 특정 식당의 상세 정보 (기본 정보, 메뉴 목록, 리뷰 목록 포함)를 조회합니다.
     * AVERAGE_RATING과 REVIEW_COUNT는 이 쿼리에서 직접 계산됩니다.
     * @param restaurantId 조회할 식당의 고유 ID
     * @return 특정 식당의 상세 정보 (RestaurantReviewDTO)
     */
    RestaurantReviewDTO getRestaurantDetailsWithMenusAndReviews(@Param("restaurantId") Long restaurantId);

    /**
     * 새로운 리뷰를 데이터베이스에 삽입합니다.
     * REVIEW_ID는 이 매퍼에서 1로 고정됩니다. (테스트용)
     * @param restaurantId 리뷰를 작성할 식당의 ID
     * @param reviewDetailDTO 삽입할 리뷰의 상세 정보 (reviewContent, reviewRating, userId 등)
     */
    void insertReview(@Param("restaurantId") Long restaurantId, @Param("review") ReviewDetailDTO reviewDetailDTO);

    // ✨ updateRestaurantRatingAndCount 메서드는 여기에서 제거합니다.
    // DB 테이블에 컬럼이 없고, 조회 시마다 계산할 것이기 때문입니다.
    // void updateRestaurantRatingAndCount(@Param("restaurantId") Long restaurantId);


    /**
     * TB_REVIEW 테이블에서 해당 식당의 모든 리뷰를 가져오는 메서드 (MyBatis collection 매핑용)
     * 이 메서드는 RestaurantReviewDAO.xml에서 getRestaurantDetailsWithMenusAndReviews의 collection 태그에 의해 호출됩니다.
     * @param restaurantId 리뷰를 조회할 식당의 ID
     * @return 해당 식당의 리뷰 목록
     */
    List<ReviewDetailDTO> getReviewsByRestaurantId(@Param("restaurantId") Long restaurantId);
}