package fs.human.yabab.Stadium.service;

import fs.human.yabab.Stadium.dao.StadiumResDAO;
import fs.human.yabab.Stadium.vo.StadiumResDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StadiumResService {
    private final StadiumResDAO stadiumResDAO;

    @Autowired
    public StadiumResService(StadiumResDAO stadiumResDAO) {
        this.stadiumResDAO = stadiumResDAO;
    }

    /**
     * 특정 경기장의 식당 목록을 필터링, 정렬 및 페이징하여 조회합니다.
     *
     * @param stadiumId              경기장 ID
     * @param restaurantInsideFlag   구장 내부/외부 플래그 (0: 내부, 1: 외부 등)
     * @param infieldOutfield        내야/외야 필터 목록 (예: "INFIELD", "OUTFIELD")
     * @param base                   1루/3루 필터 목록 (예: "FIRST_BASE", "THIRD_BASE")
     * @param floor                  층 필터 목록 (예: "F1", "F2")
     * @param sortBy                 정렬 기준 (예: "rating", "reviewCount", "id", "name" 등)
     * @param page                   현재 페이지 번호 (0-indexed)
     * @param size                   페이지당 항목 수
     * @return 식당 목록, 총 페이지 수, 총 요소 수 등을 포함하는 Map
     */
    public Map<String, Object> getRestaurantListByStadium(
            Long stadiumId,
            Integer restaurantInsideFlag,
            List<String> infieldOutfield, // 추가된 필터 파라미터
            List<String> base,            // 추가된 필터 파라미터
            List<String> floor,           // 추가된 필터 파라미터
            String sortBy,
            int page,
            int size) {

        int offset = page * size;

        String orderByColumn;
        switch (sortBy) {
            case "reviewCount":
                orderByColumn = "review_count";
                break;
            case "id": // DAO의 sortBy 조건에 id가 있으므로 추가
                orderByColumn = "id";
                break;
            case "name": // DAO의 sortBy 조건에 name이 있으므로 추가
                orderByColumn = "name";
                break;
            case "rating":
            default:
                orderByColumn = "rating";
                break;
        }

        // DAO로 넘기기 전에 필터 리스트가 null인 경우 빈 리스트로 초기화하여 NPE 방지
        // MyBatis의 <if test="... != null and !...isEmpty()"> 조건문이 이를 처리하지만,
        // 서비스 계층에서 방어적으로 처리하는 것이 좋습니다.
        List<String> safeInfieldOutfield = infieldOutfield != null ? infieldOutfield : Collections.emptyList();
        List<String> safeBase = base != null ? base : Collections.emptyList();
        List<String> safeFloor = floor != null ? floor : Collections.emptyList();


        List<StadiumResDTO> restaurants = stadiumResDAO.selectRestaurantsByStadiumAndFlag(
                stadiumId,
                restaurantInsideFlag,
                safeInfieldOutfield, // 수정된 파라미터
                safeBase,            // 수정된 파라미터
                safeFloor,           // 수정된 파라미터
                orderByColumn,
                offset,
                size
        );

        int totalCount = stadiumResDAO.countRestaurantsByStadiumAndFlag(
                stadiumId,
                restaurantInsideFlag,
                safeInfieldOutfield, // 수정된 파라미터
                safeBase,            // 수정된 파라미터
                safeFloor            // 수정된 파라미터
        );
        int totalPages = (int) Math.ceil((double) totalCount / size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", restaurants);
        response.put("totalPages", totalPages);
        response.put("totalElements", totalCount);
        response.put("currentPage", page);
        response.put("size", size);

        return response;
    }

    /**
     * 특정 ID의 식당 상세 정보를 조회합니다.
     * @param id 식당 ID
     * @return 해당 식당의 StadiumResDTO
     */
    public StadiumResDTO getRestaurantDetail(Long id) {
        return stadiumResDAO.selectRestaurantDetailById(id);
    }
}