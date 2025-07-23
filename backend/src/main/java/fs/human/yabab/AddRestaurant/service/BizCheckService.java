package fs.human.yabab.AddRestaurant.service;

import fs.human.yabab.AddRestaurant.vo.BizCheckRequest;
import fs.human.yabab.AddRestaurant.vo.BizCheckResponse;
import fs.human.yabab.AddRestaurant.vo.FullBizInfoCheckRequest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class BizCheckService {
    @Value("${api.nts-biz-check-url}")
    private String ntsBizCheckUrl;

    @Value("${service-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public BizCheckResponse checkBizNumberStatus(BizCheckRequest request) {
        String apiUrl = ntsBizCheckUrl + "/status?serviceKey=" + apiKey;
        log.info("NTS /v1/status Request URL: {}", apiUrl);

        Map<String, Object> requestBody = Map.of("b_no", Collections.singletonList(request.getB_no()));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    httpEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                log.info("NTS /v1/status RAW Response Body: {}", responseEntity.getBody());
                List<Map<String, Object>> data = (List<Map<String, Object>>) responseEntity.getBody().get("data");

                if (data == null || data.isEmpty()) {
                    BizCheckResponse resp = new BizCheckResponse();
                    resp.setValid(false);
                    resp.setMessage("사업자 정보를 찾을 수 없습니다.");
                    resp.setB_stt("정보 없음");
                    return resp;
                }

                Map<String, Object> bizInfo = data.get(0);
                String bStt = Objects.toString(bizInfo.get("b_stt"), "");
                String corpName = Objects.toString(bizInfo.get("b_nm"), "");

                boolean isValid = "계속사업자".equals(bStt);

                BizCheckResponse resp = new BizCheckResponse();
                resp.setValid(isValid);
                resp.setB_stt(bStt);
                resp.setB_nm(corpName);
                resp.setB_no(request.getB_no());

                return resp;
            } else {
                String errorMessage = "공공 API 응답 오류: HTTP " + responseEntity.getStatusCode();
                if (responseEntity.getBody() != null) {
                    errorMessage += " - " + responseEntity.getBody().toString();
                }
                log.error("공공 API 응답 오류 (checkBizNumberStatus): Status={}, Body={}", responseEntity.getStatusCode(), responseEntity.getBody());

                BizCheckResponse resp = new BizCheckResponse();
                resp.setValid(false);
                resp.setMessage("사업자 번호 조회 실패: " + errorMessage);
                return resp;
            }

        } catch (Exception e) {
            log.error("사업자 번호 조회 중 오류 발생: {}", e.getMessage(), e);
            BizCheckResponse resp = new BizCheckResponse();
            resp.setValid(false);
            resp.setMessage("사업자 번호 조회 중 오류 발생: " + e.getMessage());
            return resp;
        }
    }

    public BizCheckResponse validateFullBusinessInfo(FullBizInfoCheckRequest request) {
        String apiUrl = ntsBizCheckUrl + "/validate?serviceKey=" + apiKey;
        log.info("NTS /v1/validate Request URL: {}", apiUrl);

        Map<String, String> singleBizInfo = new HashMap<>();
        singleBizInfo.put("b_no", request.getB_no() != null ? request.getB_no().trim() : "");
        singleBizInfo.put("start_dt", request.getStart_dt() != null ? request.getStart_dt().trim() : "");
        singleBizInfo.put("p_nm", request.getP_nm() != null ? request.getP_nm().trim() : "");
        singleBizInfo.put("b_nm", request.getRestaurantName() != null ? request.getRestaurantName().trim() : "");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("businesses", List.of(singleBizInfo));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(requestBody, headers);

        log.info("NTS /v1/validate Request Body: {}", requestBody);

        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    httpEntity,
                    new ParameterizedTypeReference<>() {}
            );

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                log.info("NTS /v1/validate RAW Response Body: {}", responseEntity.getBody());

                List<Map<String, Object>> dataList = (List<Map<String, Object>>) responseEntity.getBody().get("data");

                if (dataList == null || dataList.isEmpty()) {
                    BizCheckResponse resp = new BizCheckResponse();
                    resp.setValid(false);
                    resp.setMessage("입력하신 정보와 일치하는 사업자 정보를 찾을 수 없습니다.");
                    resp.setB_stt("정보 없음");
                    return resp;
                }

                Map<String, Object> bizInfo = dataList.get(0);

                String apiValidCode = Objects.toString(bizInfo.get("valid"), "");
                Map<String, Object> statusInfo = (Map<String, Object>) bizInfo.get("status");
                String bStt = (statusInfo != null) ? Objects.toString(statusInfo.get("b_stt"), "") : "";

                // 상호명 비교 로직 제거
                boolean isValidCode = "01".equals(apiValidCode) || "true".equalsIgnoreCase(apiValidCode) || Boolean.TRUE.toString().equalsIgnoreCase(apiValidCode);
                boolean isValid = isValidCode && "계속사업자".equals(bStt);

                String restaurantNameFromRequest = request.getRestaurantName() != null ? request.getRestaurantName().trim() : "";

                BizCheckResponse resp = new BizCheckResponse();
                resp.setValid(isValid);
                resp.setMessage(isValid ? "모든 식당 정보가 국세청과 일치합니다." :
                        "입력하신 정보와 일치하는 사업자를 찾을 수 없습니다.");
                resp.setB_stt(bStt);
                resp.setB_nm(restaurantNameFromRequest);
                resp.setB_no(request.getB_no());
                resp.setP_nm(request.getP_nm());
                resp.setStart_dt(request.getStart_dt());

                return resp;
            } else {
                String errorMessage = "공공 API 응답 오류: HTTP " + responseEntity.getStatusCode();
                if (responseEntity.getBody() != null) {
                    errorMessage += " - " + responseEntity.getBody().toString();
                }
                log.error("공공 API 응답 오류 (validateFullBusinessInfo): Status={}, Body={}", responseEntity.getStatusCode(), responseEntity.getBody());

                BizCheckResponse resp = new BizCheckResponse();
                resp.setValid(false);
                resp.setMessage("식당 정보 확인 실패: " + errorMessage);
                return resp;
            }

        } catch (Exception e) {
            log.error("식당 전체 정보 조회 중 오류 발생: {}", e.getMessage(), e);

            BizCheckResponse resp = new BizCheckResponse();
            resp.setValid(false);
            resp.setMessage("식당 전체 정보 조회 중 오류 발생: " + e.getMessage());
            return resp;
        }
    }
}

