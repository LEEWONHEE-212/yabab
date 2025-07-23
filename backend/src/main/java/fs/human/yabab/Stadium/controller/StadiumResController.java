package fs.human.yabab.Stadium.controller;

import fs.human.yabab.Stadium.service.StadiumResService;
import fs.human.yabab.Stadium.vo.StadiumResDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/Stadium")
@CrossOrigin(origins = "http://localhost:3000")
public class StadiumResController {
    private final StadiumResService stadiumResService;

    @Autowired
    public StadiumResController(StadiumResService stadiumResService) {
        this.stadiumResService = stadiumResService;
    }

    @GetMapping("/restaurants")
    public ResponseEntity<Map<String, Object>> getRestaurants(
            @RequestParam("stadiumId") Long stadiumId,
            @RequestParam("restaurantInsideFlag") Integer restaurantInsideFlag,
            // 필터 파라미터 추가 - List<String> 타입으로 받음
            @RequestParam(value = "infieldOutfield", required = false) List<String> infieldOutfield,
            @RequestParam(value = "base", required = false) List<String> base,
            @RequestParam(value = "floor", required = false) List<String> floor,
            @RequestParam(value = "sortBy", defaultValue = "rating") String sortBy,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size
    ) {
        Map<String, Object> response = stadiumResService.getRestaurantListByStadium(
                stadiumId,
                restaurantInsideFlag,
                infieldOutfield, // 추가된 필터 파라미터 전달
                base,            // 추가된 필터 파라미터 전달
                floor,           // 추가된 필터 파라미터 전달
                sortBy,
                page,
                size
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/restaurants/{id}")
    public ResponseEntity<StadiumResDTO> getRestaurantDetail(@PathVariable("id") Long id) {
        StadiumResDTO restaurant = stadiumResService.getRestaurantDetail(id);
        if (restaurant == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(restaurant);
    }
}