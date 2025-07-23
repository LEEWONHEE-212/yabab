package fs.human.yabab.Stadium.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantPageResponse {
    private List<StadiumResDTO> content;
    private int totalPages;             // 전체 페이지 수
    private long totalElements;         // 전체 식당 개수 (페이징된 결과를 보여줄 때 필요)
    private int currentPage;            // 현재 페이지 번호
    private int size;
}
