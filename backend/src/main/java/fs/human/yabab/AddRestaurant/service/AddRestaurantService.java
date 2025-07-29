package fs.human.yabab.AddRestaurant.service;

import fs.human.yabab.AddRestaurant.dao.AddRestaurantDAO;
import fs.human.yabab.AddRestaurant.vo.RestaurantRegisterRequest;
import fs.human.yabab.AddRestaurant.vo.StadiumDTO;
import fs.human.yabab.AddRestaurant.vo.ZoneDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File; // ⭐ File 클래스 import 추가 ⭐
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AddRestaurantService {
    private final AddRestaurantDAO addRestaurantDAO;

    @Value("${upload.uploads.image.dir}")
    private String uploadDir;

    @Autowired
    public AddRestaurantService(AddRestaurantDAO addRestaurantDAO) {
        this.addRestaurantDAO = addRestaurantDAO;
    }

    @Transactional(readOnly = true)
    public List<StadiumDTO> getAllStadiums() {
        return addRestaurantDAO.selectAllStadiumNamesAndIds();
    }

    @Transactional(readOnly = true)
    public List<ZoneDTO> getZonesForStadium(Long stadiumId) {
        if (stadiumId == null) {
            return new ArrayList<>();
        }
        return addRestaurantDAO.getZonesByStadiumId(stadiumId);
    }

    // 새로운 식당 정보를 등록
    @Transactional
    public boolean registerRestaurant(RestaurantRegisterRequest request) throws IOException {
        MultipartFile imageFile = request.getRestaurantImageFile();

        if (imageFile != null && !imageFile.isEmpty()) {
            // 1. 파일 저장 디렉토리 확인 및 생성
            // WebConfig와 동일하게 File 객체를 통해 uploadDir의 절대 경로를 얻습니다.
            // 이렇게 하면 "uploads"가 JVM의 현재 작업 디렉토리를 기준으로 해석되어 일관성이 유지됩니다.
            Path uploadPath = Paths.get(new File(uploadDir).getAbsolutePath()); // ⭐ 이 부분이 수정되었습니다. ⭐

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. 파일명 생성 및 저장
            String originalFileName = imageFile.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String newFileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(newFileName);
            Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 3. 데이터베이스에 저장할 이미지 경로 설정
            // 웹에서 접근 가능한 URL 경로를 저장합니다. WebConfig의 ResourceHandler와 일치해야 합니다.
            request.setRestaurantImagePath("/uploads/" + newFileName);
            request.setRestaurantImageName(newFileName);
        } else {
            request.setRestaurantImagePath(null);
            request.setRestaurantImageName(null);
        }

        // DAO를 호출하여 식당 정보를 DB에 삽입
        int insertedRows = addRestaurantDAO.insertRestaurant(request);
        return insertedRows == 1;
    }
}
