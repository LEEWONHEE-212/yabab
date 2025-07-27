import React, { useState, useEffect } from "react";
import axios from 'axios';
import './EditRestaurant.css'; // 이 경로가 정확한지 확인해주세요.

// Custom Modal Component for confirmations and alerts
const CustomModal = ({ message, onConfirm, onCancel, showCancel = false }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <p className="text-lg mb-6 text-gray-800 text-center">{message}</p>
                <div className="flex justify-center space-x-4">
                    {showCancel && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                        >
                            취소
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};


const EditRestaurant = ({ restaurantData, onSave, onCancel }) => {
    // --- 음식점 정보 상태 관리 (restaurantData props로 초기화) ---
    // Destructure restaurantData for easier access and clarity
    const {
        id,
        restaurantName: initialRestaurantName,
        stadiumName: initialStadiumName,
        restaurantResvStatus: initialRestaurantResvStatus,
        restaurantInsideFlag: initialRestaurantInsideFlag,
        restaurantImagePath: initialRestaurantImagePath,
        restaurantPhone: initialRestaurantPhone,
        restaurantAddr1: initialRestaurantAddr1,
        restaurantAddr2: initialRestaurantAddr2,
        restaurantOpenTime: initialRestaurantOpenTime,
        restaurantLastOrder: initialRestaurantLastOrder,
        restaurantBreakTime: initialRestaurantBreakTime,
        restaurantRestDay: initialRestaurantRestDay,
        restaurantLocation: initialRestaurantLocation,
        zoneName: initialZoneName
    } = restaurantData || {}; // Destructure with default empty object to avoid errors if restaurantData is null/undefined

    const [restaurantName, setRestaurantName] = useState(initialRestaurantName || '');
    const [stadiumName, setStadiumName] = useState(initialStadiumName || ''); // 선택된 구장 이름
    // Convert numerical status (0, 1) to user-friendly string
    const [restaurantResvStatus, setRestaurantResvStatus] = useState(
        initialRestaurantResvStatus === 0 ? '예약 가능' : '예약 불가능'
    );
    // restaurantInsideFlag는 이제 사용자가 직접 변경할 수 없으며, restaurantData에 따라 초기화됩니다.
    // 이 값은 이 페이지에서 UI로 보여지지 않지만, 백엔드 전송 시 사용됩니다.
    const [restaurantInsideFlag, setRestaurantInsideFlag] = useState(initialRestaurantInsideFlag);

    // 모든 필드 상태는 항상 유지되도록 합니다.
    const [restaurantPhone, setRestaurantPhone] = useState(initialRestaurantPhone || '');
    const [restaurantAddr1, setRestaurantAddr1] = useState(initialRestaurantAddr1 || '');
    const [restaurantAddr2, setRestaurantAddr2] = useState(initialRestaurantAddr2 || '');
    const [restaurantOpenTime, setRestaurantOpenTime] = useState(initialRestaurantOpenTime || '');
    const [restaurantLastOrder, setRestaurantLastOrder] = useState(initialRestaurantLastOrder || '');
    const [restaurantBreakTime, setRestaurantBreakTime] = useState(initialRestaurantBreakTime || '');
    const [restaurantRestDay, setRestaurantRestDay] = useState(initialRestaurantRestDay || '');

    // ✨ 수정: 구역은 zoneName, 상세 구역은 restaurantLocation으로 매핑
    const [zoneName, setZoneName] = useState(initialZoneName || ''); // 내부 식당의 구역
    const [restaurantLocation, setRestaurantLocation] = useState(initialRestaurantLocation || ''); // 내부 식당의 상세 구역 (백엔드 필드명에 맞춤)

    const [imageFile, setImageFile] = useState(null);
    // 이미지 미리보기 URL은 항상 18000 포트를 사용합니다.
    const [imagePreviewUrl, setImagePreviewUrl] = useState(initialRestaurantImagePath ? `http://localhost:18090${initialRestaurantImagePath}` : null);

    // --- 구장 선택 옵션 상태 (백엔드에서 가져올 데이터) ---
    const [stadiumOptions, setStadiumOptions] = useState([]);

    // --- Modal State ---
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalOnConfirm, setModalOnConfirm] = useState(() => () => {});
    const [modalOnCancel, setModalOnCancel] = useState(() => () => {});
    const [modalShowCancel, setModalShowCancel] = useState(false);

    // Function to show custom alert
    const showAlert = (message) => {
        setModalMessage(message);
        setModalShowCancel(false);
        setModalOnConfirm(() => {
            setShowModal(false);
        });
        setShowModal(true);
    };

    // Function to show custom confirmation
    const showConfirm = (message, onConfirmCallback, onCancelCallback) => {
        setModalMessage(message);
        setModalShowCancel(true);
        setModalOnConfirm(() => {
            setShowModal(false);
            onConfirmCallback();
        });
        setModalOnCancel(() => {
            setShowModal(false);
            onCancelCallback();
        });
        setShowModal(true);
    };


    // --- 컴포넌트 마운트 시 구장 데이터 가져오기 ---
    useEffect(() => {
        const fetchStadiums = async () => {
            try {
                // 백엔드 API 주소를 18000으로 변경
                const response = await axios.get('http://localhost:18090/api/owner/restaurants/stadiums/names-ids');
                setStadiumOptions(response.data);
            } catch (error) {
                console.error("구장 목록을 가져오는 데 실패했습니다:", error.response ? error.response.data : error.message);
                showAlert("구장 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        };

        fetchStadiums();
    }, []); // 빈 배열: 컴포넌트가 처음 마운트될 때 한 번만 실행

    // --- restaurantData prop이 변경될 때마다 폼 필드 초기화 ---
    useEffect(() => {
        if (restaurantData) {
            setRestaurantName(restaurantData.restaurantName || '');
            setStadiumName(restaurantData.stadiumName || '');
            setRestaurantResvStatus(restaurantData.restaurantResvStatus === 0 ? '예약 가능' : '예약 불가능');
            setRestaurantInsideFlag(restaurantData.restaurantInsideFlag); // 이 값은 계속 받아옵니다.
            setImagePreviewUrl(restaurantData.restaurantImagePath ? `http://localhost:18090${restaurantData.restaurantImagePath}` : null);

            // Set all fields from restaurantData, regardless of restaurantInsideFlag
            setRestaurantPhone(restaurantData.restaurantPhone || '');
            setRestaurantAddr1(restaurantData.restaurantAddr1 || '');
            setRestaurantAddr2(restaurantData.restaurantAddr2 || '');
            setRestaurantOpenTime(restaurantData.restaurantOpenTime || '');
            setRestaurantLastOrder(restaurantData.restaurantLastOrder || '');
            setRestaurantBreakTime(restaurantData.restaurantBreakTime || '');
            setRestaurantRestDay(restaurantData.restaurantRestDay || '');

            // ✨ 수정: 구역은 zoneName, 상세 구역은 restaurantLocation으로 매핑
            setZoneName(restaurantData.zoneName || '');
            setRestaurantLocation(restaurantData.restaurantLocation || '');
        }
    }, [restaurantData]); // Dependency array includes restaurantData

    // --- 이미지 파일 변경 핸들러 ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            // If user cancels file selection, revert to previous image if available
            if (restaurantData && restaurantData.restaurantImagePath) {
                setImagePreviewUrl(`http://localhost:18090${restaurantData.restaurantImagePath}`);
            } else {
                setImagePreviewUrl(null);
            }
        }
    };

    const handleFileButtonClick = () => {
        document.getElementById('image-upload-input').click();
    };

    // --- 저장 버튼 클릭 핸들러 ---
    const handleSave = async () => {
        // --- 1. restaurantData.id 값 확인 ---
        console.log("Saving restaurant data...");
        console.log("Restaurant Data received by page:", restaurantData);
        console.log("Restaurant ID (from .id):", id); // Use destructured 'id'

        if (typeof id === 'undefined' || id === null) {
            showAlert("식당 정보를 불러오지 못했거나 식당 ID가 없습니다. 페이지를 새로고침하거나 관리자에게 문의하세요.");
            return; // Stop save logic if ID is invalid
        }

        // --- 2. 필수 정보 유효성 검사 ---
        if (!restaurantName.trim() || !stadiumName.trim() || restaurantResvStatus === '') {
            showAlert('필수 정보를 모두 입력해주세요 (음식점 이름, 구장 선택, 예약 가능 여부).');
            return;
        }

        // restaurantInsideFlag에 따른 유효성 검사
        if (restaurantInsideFlag === 1) { // 구장 외부 (1)
            if (!restaurantPhone.trim() || !restaurantAddr1.trim() || !restaurantOpenTime.trim()) {
                showAlert('구장 외부 식당은 전화번호, 기본 주소, 운영 시간을 입력해야 합니다.');
                return;
            }
        } else { // 구장 내부 (0)
            // ✨ 수정: 구역은 zoneName, 상세 구역은 restaurantLocation으로 유효성 검사
            if (!zoneName.trim() || !restaurantLocation.trim()) {
                showAlert('구장 내부 식당은 구역, 상세 구역을 입력해야 합니다.');
                return;
            }
        }

        const confirmSaveMsg = '수정된 내용을 저장하시겠습니까?';
        showConfirm(confirmSaveMsg, async () => {
            const formData = new FormData();
            formData.append('id', id); // 1
            formData.append('restaurantName', restaurantName); // 2
            formData.append('stadiumName', stadiumName); // 3
            formData.append('restaurantResvStatus', restaurantResvStatus === '예약 가능' ? 0 : 1); // 4
            formData.append('restaurantInsideFlag', restaurantInsideFlag); // 5

            // Only append restaurantImage if a new file is selected
            if (imageFile) {
                formData.append('restaurantImage', imageFile); // 6 (이미지 파일이 있다면)
            }
            // If imageFile is null, the backend should interpret this as "no change to image"
            // and keep the existing restaurantImagePath. Do not send an empty 'restaurantImage' part.

            // Based on restaurantInsideFlag, append ONLY relevant fields.
            if (restaurantInsideFlag === 1) { // 구장 외부 식당
                formData.append('restaurantPhone', restaurantPhone || ''); // 7
                formData.append('restaurantAddr1', restaurantAddr1 || ''); // 8
                formData.append('restaurantOpenTime', restaurantOpenTime || ''); // 9

                // 선택적인 필드는 값이 있을 때만 append
                if (restaurantAddr2.trim()) {
                    formData.append('restaurantAddr2', restaurantAddr2); // 10 (값이 있으면)
                }
                if (restaurantLastOrder.trim()) {
                    formData.append('restaurantLastOrder', restaurantLastOrder); // 10/11 (값이 있으면)
                }
                if (restaurantBreakTime.trim()) {
                    formData.append('restaurantBreakTime', restaurantBreakTime); // 10/11/12 (값이 있으면)
                }
                if (restaurantRestDay.trim()) {
                    formData.append('restaurantRestDay', restaurantRestDay); // 10/11/12/13 (값이 있으면)
                }
                // 내부 식당 관련 필드는 아예 append 하지 않음!
                // 백엔드 DTO에서 이 필드들은 null을 허용하거나 @JsonInclude(JsonInclude.Include.NON_NULL) 등으로 처리되어야 합니다.
            } else { // 구장 내부 식당
                // ✨ 수정: 구역은 zoneName, 상세 구역은 restaurantLocation으로 전송
                formData.append('zoneName', zoneName || ''); // 7
                formData.append('restaurantLocation', restaurantLocation || ''); // 8

                // 외부 식당 관련 필드는 아예 append 하지 않음!
                // 백엔드 DTO에서 이 필드들은 null을 허용하거나 @JsonInclude(JsonInclude.Include.NON_NULL) 등으로 처리되어야 합니다.
            }

            // For debugging: log all formData entries
            // 수정된 로직으로 인해 총 파트 개수가 줄어들었는지 확인하기 위해 중요
            for (let pair of formData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }

            try {
                // 백엔드 API 주소를 18000으로 변경
                const response = await axios.put(`http://localhost:18090/api/owner/restaurants/${id}`, formData, {
                    // headers: {
                    //     'Content-Type': 'multipart/form-data', // axios가 FormData를 감지하여 자동으로 설정하므로 보통 필요 없음
                    // },
                });
                console.log("식당 정보 수정 성공:", response.data);
                showAlert('식당 정보가 성공적으로 수정되었습니다.');
                onSave(); // Call the onSave prop to notify parent component
            } catch (error) {
                console.error("식당 정보 수정 실패:", error.response ? error.response.data : error.message);
                showAlert(`식당 정보 수정에 실패했습니다: ${error.response ? error.response.data.message || error.response.statusText || '서버 오류' : error.message}`);
            }
        }, () => {
            // Do nothing if cancel is pressed
        });
    };

    // 취소 버튼 클릭 핸들러
    const handleCancel = () => {
        const cancelMsg = '수정을 취소하시겠습니까? (변경 내용은 저장되지 않습니다.)';
        showConfirm(cancelMsg, () => {
            onCancel(); // Call the onCancel prop to notify parent component
        }, () => {
            // Do nothing if cancel is pressed
        });
    };

    return (
        <div className="edit-restaurant-page-container">
            <h1 className="edit-restaurant-page-title">음식점 정보 수정</h1>

            <div className="edit-restaurant-image-upload-section">
                <div className="edit-restaurant-image-placeholder-edit">
                    {imagePreviewUrl ? (
                        <img src={imagePreviewUrl} alt="음식점 이미지 미리보기" className="edit-restaurant-image-preview" />
                    ) : (
                        <p>음식점 이미지를 추가해주세요</p>
                    )}
                </div>

                <div className="edit-restaurant-image-upload-controls">
                    <input
                        type="file"
                        id="image-upload-input"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                    <button type="button" className="edit-restaurant-find-file-button" onClick={handleFileButtonClick}>
                        파일 찾기
                    </button>
                </div>
            </div>

            <div className="edit-restaurant-form-section">
                <div className="edit-restaurant-form-group">
                    <label htmlFor="restaurant-name" className="edit-restaurant-form-label">음식점 이름</label>
                    <input
                        type="text"
                        id="restaurant-name"
                        className="edit-restaurant-form-input"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        placeholder="음식점 이름을 입력하세요"
                        required
                    />
                </div>

                <div className="edit-restaurant-form-group">
                    <label htmlFor="stadium-select" className="edit-restaurant-form-label">구장 선택</label>
                    <div className="edit-restaurant-form-select-wrapper">
                        <select
                            id="stadium-select"
                            className="edit-restaurant-form-select"
                            value={stadiumName}
                            onChange={(e) => setStadiumName(e.target.value)}
                            required
                        >
                            <option value="">구장을 선택하세요</option>
                            {stadiumOptions.map((stadium) => (
                                <option key={stadium.id} value={stadium.stadiumName}>
                                    {stadium.stadiumName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* restaurantInsideFlag 값에 따라 조건부 렌더링되는 필드 */}
                {restaurantInsideFlag === 1 ? ( // 구장 외부 식당 필드
                    <>
                        <div className="edit-restaurant-form-group">
                            <label htmlFor="phone-number" className="edit-restaurant-form-label">식당 전화번호</label>
                            <input
                                type="text"
                                id="phone-number"
                                className="edit-restaurant-form-input"
                                value={restaurantPhone}
                                onChange={(e) => setRestaurantPhone(e.target.value)}
                                placeholder="예: 02-1234-5678"
                                required
                            />
                        </div>
                        <div className="edit-restaurant-form-group">
                            <label htmlFor="basic-address" className="edit-restaurant-form-label">기본 주소</label>
                            <input
                                type="text"
                                id="basic-address"
                                className="edit-restaurant-form-input"
                                value={restaurantAddr1}
                                onChange={(e) => setRestaurantAddr1(e.target.value)}
                                placeholder="예: 서울시 송파구 올림픽로 123"
                                required
                            />
                        </div>
                        <div className="edit-restaurant-form-group">
                            <label htmlFor="detail-address" className="edit-restaurant-form-label">상세 주소</label>
                            <input
                                type="text"
                                id="detail-address"
                                className="edit-restaurant-form-input"
                                value={restaurantAddr2}
                                onChange={(e) => setRestaurantAddr2(e.target.value)}
                                placeholder="예: 롯데월드타워 지하 1층 (선택)" // 선택적 필드임을 명시
                            />
                        </div>
                        <div className="edit-restaurant-form-group">
                            <label htmlFor="opening-hours" className="edit-restaurant-form-label">운영 시간</label>
                            <input
                                type="text"
                                id="opening-hours"
                                className="edit-restaurant-form-input"
                                value={restaurantOpenTime}
                                onChange={(e) => setRestaurantOpenTime(e.target.value)}
                                placeholder="예: 매일 10:00 - 22:00"
                                required
                            />
                        </div>
                        <div className="edit-restaurant-form-group">
                            <label htmlFor="last-order-time" className="edit-restaurant-form-label">라스트 오더 시간</label>
                            <input
                                type="text"
                                id="last-order-time"
                                className="edit-restaurant-form-input"
                                value={restaurantLastOrder}
                                onChange={(e) => setRestaurantLastOrder(e.target.value)}
                                placeholder="예: 21:00 (마지막 주문 가능 시간, 선택)" // 선택적 필드임을 명시
                            />
                        </div>
                        <div className="edit-restaurant-form-group">
                            <label htmlFor="break-time" className="edit-restaurant-form-label">브레이크 타임</label>
                            <input
                                type="text"
                                id="break-time"
                                className="edit-restaurant-form-input"
                                value={restaurantBreakTime}
                                onChange={(e) => setRestaurantBreakTime(e.target.value)}
                                placeholder="예: 15:00 - 17:00 (없으면 비워두세요)" // 선택적 필드임을 명시
                            />
                        </div>
                        <div className="edit-restaurant-form-group">
                            <label htmlFor="closing-days" className="edit-restaurant-form-label">휴무일</label>
                            <input
                                type="text"
                                id="closing-days"
                                className="edit-restaurant-form-input"
                                value={restaurantRestDay}
                                onChange={(e) => setRestaurantRestDay(e.target.value)}
                                placeholder="예: 매주 월요일, 공휴일 (없으면 비워두세요)" // 선택적 필드임을 명시
                            />
                        </div>
                    </>
                ) : ( // 구장 내부 식당 필드
                    <>
                        <div className="edit-restaurant-form-group">
                            {/* ✨ 수정: 구역은 zoneName으로 매핑 */}
                            <label htmlFor="zone-name" className="edit-restaurant-form-label">구역</label>
                            <input
                                type="text"
                                id="zone-name"
                                className="edit-restaurant-form-input"
                                value={zoneName}
                                onChange={(e) => setZoneName(e.target.value)}
                                placeholder="예: 1루, 3루, 외야"
                                required
                            />
                        </div>
                        <div className="edit-restaurant-form-group">
                            {/* ✨ 수정: 상세 구역은 restaurantLocation으로 매핑 */}
                            <label htmlFor="restaurant-location" className="edit-restaurant-form-label">상세 구역</label>
                            <input
                                type="text"
                                id="restaurant-location"
                                className="edit-restaurant-form-input"
                                value={restaurantLocation}
                                onChange={(e) => setRestaurantLocation(e.target.value)}
                                placeholder="예: 내야석 101구역, 중앙매표소 근처"
                                required
                            />
                        </div>
                    </>
                )}

                <div className="edit-restaurant-form-group edit-restaurant-radio-group">
                    <label className="edit-restaurant-form-label">예약 가능 여부</label>
                    <div className="edit-restaurant-radio-options">
                        <label className="edit-restaurant-radio-label">
                            <input
                                type="radio"
                                name="reservation-availability"
                                value="예약 가능"
                                checked={restaurantResvStatus === '예약 가능'}
                                onChange={(e) => setRestaurantResvStatus(e.target.value)}
                            />
                            예약 가능
                        </label>
                        <label className="edit-restaurant-radio-label">
                            <input
                                type="radio"
                                name="reservation-availability"
                                value="예약 불가능"
                                checked={restaurantResvStatus === '예약 불가능'}
                                onChange={(e) => setRestaurantResvStatus(e.target.value)}
                            />
                            예약 불가능
                        </label>
                    </div>
                </div>
            </div>

            <div className="edit-restaurant-form-buttons-container">
                <button type="button" className="edit-restaurant-save-button" onClick={handleSave}>
                    저장
                </button>
                <button type="button" className="edit-restaurant-cancel-button" onClick={handleCancel}>
                    취소
                </button>
            </div>

            {showModal && (
                <CustomModal
                    message={modalMessage}
                    onConfirm={modalOnConfirm}
                    onCancel={modalOnCancel}
                    showCancel={modalShowCancel}
                />
            )}
        </div>
    );
};

export default EditRestaurant;
