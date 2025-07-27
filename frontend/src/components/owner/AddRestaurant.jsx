import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import './AddRestaurant.css';
import AdditionalInfoModal from './AdditionalINfoModal';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../common/Header';
import { UserContext } from '../../context/UserContext';

const AddRestaurant = () => {
    const navigate = useNavigate();
    const { user, setUser, isLoading: isUserLoading } = useContext(UserContext); // UserContext의 isLoading을 isUserLoading으로 변경하여 충돌 방지

    // --- 공통 필드 상태 (사업자 인증 및 기본 정보) ---
    const [businessNumber, setBusinessNumber] = useState('');
    const [restaurantName, setRestaurantName] = useState('');
    const [selectedStadiumId, setSelectedStadiumId] = useState('');
    const [selectedStadiumName, setSelectedStadiumName] = useState('');
    const [restaurantImage, setRestaurantImage] = useState(null);
    const [restaurantImagePreview, setRestaurantImagePreview] = useState(null); // 이미지 미리보기 URL
    const [isReservable, setIsReservable] = useState(true);

    // 사업자/식당 이름 인증 관련 상태
    const [openDate, setOpenDate] = useState('');
    const [ceoName, setCeoName] = useState('');
    const [isBizNumberVerified, setIsBizNumberVerified] = useState(false);
    const [bizCheckMessage, setBizCheckMessage] = useState('');
    const [isRestaurantNameVerified, setIsRestaurantNameVerified] = useState(false);
    const [restaurantNameVerifyMessage, setRestaurantNameVerifyMessage] = useState('');
    const [apiCorpName, setApiCorpName] = useState('');
    const [isAdditionalInfoModalOpen, setIsAdditionalInfoModalOpen] = useState(false);

    // --- 탭 선택 상태 ---
    const locationType = 'internal'; // 구장 외부 식당 로직이 없어지므로 'internal'로 고정

    // --- 구장 내부 식당 전용 필드 상태 ---
    const [selectedInnerZoneId, setSelectedInnerZoneId] = useState('');
    const [innerZoneName, setInnerZoneName] = useState('');
    const [detailZone, setDetailZone] = useState('');
    const [zoneOptions, setZoneOptions] = useState([]);

    // 구장 선택 옵션 (백엔드에서 가져올 데이터)
    const [stadiumOptions, setStadiumOptions] = useState([]);

    // 로딩 상태 추가
    const [isSubmitting, setIsSubmitting] = useState(false); // 폼 제출 중 로딩
    const [isCheckingBizNumber, setIsCheckingBizNumber] = useState(false); // 사업자 번호 확인 중 로딩
    const [isVerifyingRestaurantName, setIsVerifyingRestaurantName] = useState(false); // 식당 이름 확인 중 로딩

    // user.userId를 사용하기 전에 로딩 상태를 확인하고, 유효한 사용자인지 검사
    useEffect(() => {
        if (!isUserLoading && (!user || user.userRole !== 2)) {
            alert("식당을 등록하려면 사장 계정으로 로그인해야 합니다.");
            navigate('/auth/login');
        }
    }, [user, isUserLoading, navigate]);

    // 경기장 목록을 백엔드에서 가져오는 useEffect
    useEffect(() => {
        const fetchStadiums = async () => {
            try {
                const response = await axios.get('http://localhost:18090/api/restaurants/stadiums/names-ids');
                setStadiumOptions(response.data);
            } catch (error) {
                console.error("경기장 목록을 가져오는 중 에러 발생:", error);
                // alert("경기장 목록을 불러오는 데 실패했습니다."); // 사용자 경험을 위해 alert 대신 메시지 표시 고려
            }
        };

        fetchStadiums();
    }, []);

    // selectedStadiumId가 변경될 때마다 해당 구장의 구역 목록을 가져오는 useEffect
    useEffect(() => {
        const fetchZones = async () => {
            if (selectedStadiumId) {
                try {
                    const response = await axios.get(`http://localhost:18090/api/restaurants/stadiums/${selectedStadiumId}/zones`);
                    setZoneOptions(response.data);
                    setSelectedInnerZoneId('');
                    setInnerZoneName('');
                } catch (error) {
                    console.error("구역 목록을 가져오는 중 에러 발생:", error);
                    setZoneOptions([]);
                    setSelectedInnerZoneId('');
                    setInnerZoneName('');
                    // alert("구역 목록을 불러오는 데 실패했습니다.");
                }
            } else {
                setZoneOptions([]);
                setSelectedInnerZoneId('');
                setInnerZoneName('');
            }
        };

        fetchZones();
    }, [selectedStadiumId]);

    // 구장 선택 핸들러
    const handleStadiumChange = (e) => {
        const selectedId = e.target.value;
        const selectedName = e.target.options[e.target.selectedIndex].text;

        setSelectedStadiumId(selectedId);
        setSelectedStadiumName(selectedName);
        setDetailZone('');
    };

    // 구역 선택 핸들러
    const handleInnerZoneChange = (e) => {
        const selectedId = e.target.value;
        const selectedName = e.target.options[e.target.selectedIndex].text;

        setSelectedInnerZoneId(selectedId);
        setInnerZoneName(selectedName);
    };

    // 선택된 파일 객체를 상태에 저장하고 미리보기 생성
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setRestaurantImage(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRestaurantImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setRestaurantImagePreview(null);
        }
    };

    // 사업자 번호 입력 처리 및 숫자만 남기기
    const handleBusinessNumberChange = (e) => {
        const cleanedValue = e.target.value.replace(/[^0-9]/g, "");
        setBusinessNumber(cleanedValue);
        setIsBizNumberVerified(false);
        setBizCheckMessage('');
        setIsRestaurantNameVerified(false);
        setRestaurantNameVerifyMessage('');
        setApiCorpName('');
        setOpenDate('');
        setCeoName('');
        setIsAdditionalInfoModalOpen(false);
    };

    // 폼 제출
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return; // 중복 제출 방지

        if (isUserLoading) {
            alert("사용자 정보를 로딩 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        if (!user || user.userRole !== 2) {
            alert("식당을 등록할 권한이 없습니다. 사장 계정으로 로그인해주세요.");
            navigate('/auth/login');
            return;
        }

        // 최종 유효성 검사 (공통)
        if (!isBizNumberVerified) {
            setBizCheckMessage("사업자 번호를 먼저 확인해주세요.");
            return;
        }

        if (!isRestaurantNameVerified) {
            setRestaurantNameVerifyMessage("식당 이름을 먼저 확인해주세요.");
            return;
        }

        if (!selectedStadiumId) {
            alert("구장을 선택해주세요.");
            return;
        }

        if (!restaurantImage) {
            alert("식당 사진을 업로드해주세요.");
            return;
        }

        // 구장 내부 식당 유효성 검사
        if (!selectedInnerZoneId || !detailZone) {
            alert("구장 내부 식당의 구역 및 상세 구역을 입력해주세요.");
            return;
        }

        const requestData = {
            ownerId: user.userId,
            businessNumber: businessNumber,
            restaurantName: restaurantName,
            stadiumId: selectedStadiumId,
            restaurantResvStatus: isReservable ? 0 : 1,
            restaurantInsideFlag: 0, // 항상 0: 내부 식당

            restaurantAddr1: null,
            restaurantAddr2: null,
            restaurantTel: null,
            restaurantOpenTime: null,
            restaurantLastOrder: null,
            restaurantBreakTime: null,
            restaurantRestDay: null,
            restaurantMapX: null,
            restaurantMapY: null,
            restaurantMenuName: null,
            restaurantMenuPrice: null,

            zoneId: selectedInnerZoneId,
            restaurantLocation: detailZone,
        };

        const formData = new FormData();
        formData.append('request', JSON.stringify(requestData));
        formData.append('restaurantImageFile', restaurantImage);

        setIsSubmitting(true);
        try {
            const response = await axios.post(`http://localhost:18090/api/restaurants/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                alert("식당 등록이 성공적으로 완료되었습니다!");
                // 폼 초기화
                setBusinessNumber('');
                setIsBizNumberVerified(false);
                setBizCheckMessage('');
                setIsRestaurantNameVerified(false);
                setRestaurantNameVerifyMessage('');
                setRestaurantName('');
                setOpenDate('');
                setCeoName('');
                setApiCorpName('');
                setSelectedStadiumId('');
                setSelectedStadiumName('');
                setIsReservable(true);
                setRestaurantImage(null);
                setRestaurantImagePreview(null); // 미리보기 초기화
                setSelectedInnerZoneId('');
                setInnerZoneName('');
                setDetailZone('');

                navigate('/owner');
            }
        } catch (error) {
            console.error("식당 등록 중 에러:", error);
            if (error.response) {
                alert(`식당 등록 실패: ${error.response.data.message || error.response.statusText || "서버 오류"}`);
            } else if (error.request) {
                alert("식당 등록 중 네트워크 오류가 발생했습니다. 서버가 응답하지 않습니다.");
            } else {
                alert("식당 등록 중 예상치 못한 오류가 발생했습니다.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // 사업자 번호 확인
    const handleCheckBusinessNumber = async () => {
        if (!businessNumber) {
            setBizCheckMessage('사업자 번호를 입력해주세요.');
            return;
        }
        if (businessNumber.length !== 10) {
            setBizCheckMessage('사업자 번호는 10자리 숫자여야 합니다.');
            return;
        }

        const requestData = {
            b_no: businessNumber,
        };

        setIsCheckingBizNumber(true);
        try {
            const response = await axios.post(`http://localhost:18090/api/restaurants/check-biz-number`, requestData);
            setApiCorpName(response.data.b_nm || '');

            if (response.data.valid && response.data.b_stt === "계속사업자") {
                setIsBizNumberVerified(true);
                setBizCheckMessage(`사업자 번호 확인 성공: ${response.data.message || '정상적으로 확인되었습니다.'}\n(상태: ${response.data.b_stt})`);
                // alert(`사업자 번호 확인 성공: ${response.data.message || '정상적으로 확인되었습니다.'}`); // alert 제거
                setIsRestaurantNameVerified(false);
                setRestaurantNameVerifyMessage('');
                setIsAdditionalInfoModalOpen(false);
            } else {
                setIsBizNumberVerified(false);
                setBizCheckMessage(`사업자 번호 확인 실패: ${response.data.message || "유효하지 않은 사업자 번호이거나 폐업 사업자입니다."}`);
                // alert(`사업자 번호 확인 실패: ${response.data.message || "유효하지 않은 사업자 번호이거나 폐업 사업자입니다."}`); // alert 제거
                setIsRestaurantNameVerified(false);
                setRestaurantNameVerifyMessage('');
                setIsAdditionalInfoModalOpen(false);
            }

        } catch (error) {
            console.error("사업자 번호 조회 중 에러:", error);
            setIsBizNumberVerified(false);
            setBizCheckMessage("네트워크 오류가 발생했습니다.");
            if (error.response) {
                setBizCheckMessage(`사업자 번호 조회 실패: ${error.response.data.message || error.response.statusText || "서버 오류"}`);
            } else if (error.request) {
                setBizCheckMessage("사업자 번호 조회 중 네트워크 오류가 발생했습니다. 서버가 응답하지 않습니다.");
            } else {
                setBizCheckMessage("사업자 번호 조회 중 예상치 못한 오류가 발생했습니다.");
            }
            setIsRestaurantNameVerified(false);
            setRestaurantNameVerifyMessage('');
            setApiCorpName('');
            setIsAdditionalInfoModalOpen(false);
        } finally {
            setIsCheckingBizNumber(false);
        }
    };

    // 식당 이름 및 개업일자/대표자명 확인 (모달 띄우기)
    const handleVerifyRestaurantName = () => {
        if (!businessNumber.trim() || !isBizNumberVerified) {
            setRestaurantNameVerifyMessage("사업자 번호를 먼저 확인해주세요.");
            return;
        }

        if (!restaurantName.trim()) {
            setRestaurantNameVerifyMessage("식당 이름을 입력해주세요.");
            return;
        }

        setIsAdditionalInfoModalOpen(true);
        setIsRestaurantNameVerified(false);
        setRestaurantNameVerifyMessage('');
    };

    // 모달 내부에서 호출될 최종 확인 로직
    const handleModalSubmit = async ({ openDate: modalOpenDate, ceoName: modalCeoName }) => {
        setOpenDate(modalOpenDate);
        setCeoName(modalCeoName);
        setIsAdditionalInfoModalOpen(false); // 모달은 바로 닫고 API 호출

        if (!modalOpenDate.trim() || modalOpenDate.trim().length !== 8) {
            setRestaurantNameVerifyMessage('개업일자를 YYYYMMDD 형식으로 입력해주세요.');
            setIsAdditionalInfoModalOpen(true); // 유효성 검사 실패 시 모달 다시 열기
            return;
        }
        if (!modalCeoName.trim()) {
            setRestaurantNameVerifyMessage('대표자명을 입력해주세요.');
            setIsAdditionalInfoModalOpen(true); // 유효성 검사 실패 시 모달 다시 열기
            return;
        }

        const requestData = {
            b_no: businessNumber,
            restaurantName: restaurantName,
            start_dt: modalOpenDate,
            p_nm: modalCeoName,
        };

        setIsVerifyingRestaurantName(true);
        try {
            const response = await axios.post(`http://localhost:18090/api/restaurants/check-biz-info-full`, requestData);

            if (response.data.valid) {
                setIsRestaurantNameVerified(true);
                setRestaurantNameVerifyMessage(response.data.message || "식당 정보가 국세청과 일치합니다.");
                // alert(response.data.message || "식당 정보가 국세청과 일치합니다!"); // alert 제거
                setIsAdditionalInfoModalOpen(false);
            } else {
                setIsRestaurantNameVerified(false);
                setRestaurantNameVerifyMessage(response.data.message || "입력하신 정보와 일치하는 사업자를 찾을 수 없습니다.");
                // alert(response.data.message || "입력하신 정보와 일치하는 사업자를 찾을 수 없습니다."); // alert 제거
                setIsAdditionalInfoModalOpen(true); // 모달 다시 열기
            }

        } catch (error) {
            console.error("추가 사업자 정보 조회 중 에러:", error);
            setIsRestaurantNameVerified(false);
            setRestaurantNameVerifyMessage("네트워크 오류가 발생했습니다.");
            if (error.response) {
                setRestaurantNameVerifyMessage(`추가 사업자 정보 조회 실패: ${error.response.data.message || error.response.statusText || "서버 오류"}`);
            } else if (error.request) {
                setRestaurantNameVerifyMessage("추가 사업자 정보 조회 중 네트워크 오류가 발생했습니다. 서버가 응답하지 않습니다.");
            } else {
                setRestaurantNameVerifyMessage("추가 사업자 정보 조회 중 예상치 못한 오류가 발생했습니다.");
            }
            setIsAdditionalInfoModalOpen(true); // 에러 발생 시 모달 다시 열기
        } finally {
            setIsVerifyingRestaurantName(false);
        }
    };

    const handleEditBizInfo = () => {
        setIsBizNumberVerified(false);
        setBizCheckMessage('');
        setIsRestaurantNameVerified(false);
        setRestaurantNameVerifyMessage('');
        setApiCorpName('');
        setOpenDate('');
        setCeoName('');
        setIsAdditionalInfoModalOpen(false);
    };

    return (
        <div className="register-restaurant-container">
            <h1 className="page-title">식당 등록</h1>
            <form onSubmit={handleSubmit}>
                {/* 사업자 번호, 식당 이름 등 인증 관련 필드 */}
                <div className="form-group">
                    <label htmlFor="business-number" className="form-label">사업자 번호</label>
                    <input
                        type="text"
                        id="business-number"
                        className="form-input"
                        value={businessNumber}
                        onChange={handleBusinessNumberChange}
                        maxLength="10"
                        placeholder="사업자 번호를 입력하세요 (숫자만)"
                        readOnly={isBizNumberVerified || isCheckingBizNumber}
                        disabled={isCheckingBizNumber} // 로딩 중 비활성화
                    />
                    {!isBizNumberVerified ? (
                        <button
                            type="button"
                            onClick={handleCheckBusinessNumber}
                            className='check-button'
                            disabled={!businessNumber || businessNumber.length !== 10 || isBizNumberVerified || isCheckingBizNumber}
                        >
                            {isCheckingBizNumber ? '조회 중...' : '조회'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleEditBizInfo}
                            className='edit-button'
                        >
                            수정
                        </button>
                    )}
                </div>
                {bizCheckMessage && (
                    <p
                        className={`message ${isBizNumberVerified ? 'success' : 'error'}`}
                        style={{ whiteSpace: 'pre-line' }}
                    >
                        {bizCheckMessage}
                    </p>
                )}

                <div className="form-group">
                    <label htmlFor="restaurant-name" className="form-label">식당 이름</label>
                    <input
                        type="text"
                        id="restaurant-name"
                        className="form-input"
                        value={restaurantName}
                        onChange={(e) => {
                            setRestaurantName(e.target.value);
                            setIsRestaurantNameVerified(false);
                            setRestaurantNameVerifyMessage('');
                            setIsAdditionalInfoModalOpen(false);
                        }}
                        placeholder="식당 이름을 입력하세요"
                        readOnly={isRestaurantNameVerified || isVerifyingRestaurantName}
                        disabled={isVerifyingRestaurantName} // 로딩 중 비활성화
                    />
                    {!isRestaurantNameVerified ? (
                        <button
                            type="button"
                            onClick={handleVerifyRestaurantName}
                            className="check-button"
                            disabled={!restaurantName.trim() || !isBizNumberVerified || isVerifyingRestaurantName}
                        >
                            {isVerifyingRestaurantName ? '확인 중...' : '확인'}
                        </button>
                    ) : null}
                </div>
                {restaurantNameVerifyMessage &&
                    <p className={`message ${isRestaurantNameVerified ? 'success' : 'error'}`}>
                        {restaurantNameVerifyMessage}
                    </p>
                }

                <AdditionalInfoModal
                    isOpen={isAdditionalInfoModalOpen}
                    onClose={() => setIsAdditionalInfoModalOpen(false)}
                    onSubmit={handleModalSubmit}
                    openDate={openDate}
                    setOpenDate={setOpenDate}
                    ceoName={ceoName}
                    setCeoName={setCeoName}
                    isLoading={isVerifyingRestaurantName} // 모달 내부에 로딩 상태 전달
                />

                {/* "구장 선택" 필드 (백엔드에서 가져온 옵션 사용) */}
                <div className="form-group">
                    <label htmlFor="stadium-select" className="form-label">구장 선택</label>
                    <select
                        id="stadium-select"
                        className="form-input"
                        value={selectedStadiumId}
                        onChange={handleStadiumChange}
                        required
                        disabled={isSubmitting}
                    >
                        <option value="">구장을 선택하세요</option>
                        {stadiumOptions.map((stadium) => (
                            <option key={stadium.id} value={stadium.id}>
                                {stadium.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 각 탭에 따른 고유 필드 렌더링 (이제 내부 식당 필드만 남음) */}
                <>
                    <div className="form-group">
                        <label htmlFor="inner-zone-select" className="form-label">구역</label>
                        <select
                            id="inner-zone-select"
                            className="form-input"
                            value={selectedInnerZoneId}
                            onChange={handleInnerZoneChange}
                            required
                            disabled={!selectedStadiumId || isSubmitting}
                        >
                            <option value="">구역을 선택하세요</option>
                            {zoneOptions.map((zone) => (
                                <option key={zone.id} value={zone.id}>
                                    {zone.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="detail-zone" className="form-label">상세 구역</label>
                        <input
                            type="text"
                            id="detail-zone"
                            className="form-input"
                            value={detailZone}
                            onChange={(e) => setDetailZone(e.target.value)}
                            placeholder="예: 110블럭"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                </>

                {/* 식당 사진 (공통) */}
                <div className="form-group file-upload-group">
                    <label htmlFor="restaurant-image" className="form-label">식당 사진</label>
                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            id="restaurant-image"
                            className="file-input"
                            onChange={handleFileChange}
                            accept="image/*"
                            required
                            disabled={isSubmitting}
                        />
                        {restaurantImage && <span className="selected-file-name">{restaurantImage.name}</span>}
                    </div>
                    {restaurantImagePreview && (
                        <div className="image-preview-container">
                            <img src={restaurantImagePreview} alt="Restaurant Preview" className="restaurant-image-preview" />
                        </div>
                    )}
                </div>

                {/* 예약 가능 여부 (공통) */}
                <div className="form-group radio-group">
                    <label className="form-label">예약 가능</label>
                    <div className="radio-options">
                        <label htmlFor="reservable-yes" className="radio-label">
                            <input
                                type="radio"
                                id="reservable-yes"
                                name="isReservable"
                                value="true"
                                checked={isReservable === true}
                                onChange={() => setIsReservable(true)}
                                disabled={isSubmitting}
                            />
                            예약 가능
                        </label>
                        <label htmlFor="reservable-no" className="radio-label">
                            <input
                                type="radio"
                                id="reservable-no"
                                name="isReservable"
                                value="false"
                                checked={isReservable === false}
                                onChange={() => setIsReservable(false)}
                                disabled={isSubmitting}
                            />
                            예약 불가능
                        </label>
                    </div>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting || isUserLoading}>
                    {isSubmitting ? '등록 중...' : '완료'}
                </button>
            </form>
        </div>
    );
};

export default AddRestaurant;