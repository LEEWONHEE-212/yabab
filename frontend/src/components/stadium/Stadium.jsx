import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Stadium.css';
import Restaurant from '../restaurant/Restaurant';
import Header from '../common/Header';
import { useParams } from 'react-router-dom';
import Footer from '../common/Footer';

// ImageModal 컴포넌트 정의
const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div className="stadium-image-modal-overlay" onClick={onClose}>
            <div className="stadium-image-modal-content" onClick={e => e.stopPropagation()}>
                <button className="stadium-image-modal-close-btn" onClick={onClose}>X</button>
                <img src={imageUrl} alt="확대 경기장 이미지" className="stadium-image-modal-img" />
            </div>
        </div>
    );
};


const Stadium = () => {
    const { stadiumId } = useParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageGroup, setCurrentPageGroup] = useState(1);

    const [stadiumData, setStadiumData] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [kakaoAppKey, setKakaoAppKey] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    // 이미지 모달 상태 추가
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [modalImagePath, setModalImagePath] = useState('');

    // 필터 상태들
    const [selectedInfieldOutfield, setSelectedInfieldOutfield] = useState([]);
    const [selectedBase, setSelectedBase] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState([]);

    // 백엔드에서 받아올 식당 데이터 상태
    const [restaurants, setRestaurants] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    // 로딩 상태 추가 (사용자 경험 개선)
    const [isLoading, setIsLoading] = useState(false);
    // 필터 미선택 시 메시지 표시를 위한 상태
    const [showNoFilterSelectedMessage, setShowNoFilterSelectedMessage] = useState(true);


    const parsedStadiumId = parseInt(stadiumId);
    const RESTAURANTS_PER_PAGE = 5;
    const PAGE_GROUP_SIZE = 10;

    useEffect(() => {
        const fetchKakaoKey = async () => {
            try {
                const response = await axios.get(`http://localhost:18090/api/kakaomap/kakao-map-key`);
                setKakaoAppKey(response.data.kakaoAppKey);
                console.log('백엔드에서 받은 카카오 앱 키:', response.data.kakaoAppKey);
            } catch (error) {
                console.error('카카오 앱 키를 불러오는 데 실패했습니다:', error);
            }
        };
        fetchKakaoKey();
    }, []);

    useEffect(() => {
        if (!kakaoAppKey) {
            console.log("카카오 앱 키가 아직 로드되지 않았습니다.");
            return;
        }

        const SCRIPT_ID = 'kakao-map-sdk';
        if (document.getElementById(SCRIPT_ID)) {
            if (window.kakao && window.kakao.maps) {
                setMapLoaded(true);
            }
            return;
        }

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.async = true;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false`;
        document.head.appendChild(script);

        script.onload = () => {
            window.kakao.maps.load(() => {
                setMapLoaded(true);
            });
        };

        return () => {
            if (document.getElementById(SCRIPT_ID)) {
                document.head.removeChild(script);
            }
        };
    }, [kakaoAppKey]);

    useEffect(() => {
        const fetchStadiumInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:18090/api/kakaomap/stadium/${parsedStadiumId}/location`);
                setStadiumData(response.data);
                console.log('백엔드에서 받은 경기장 정보:', response.data);
            } catch (error) {
                console.error('경기장 정보를 불러오는 데 실패했습니다:', error);
                setStadiumData({
                    stadiumName: '정보 없음',
                    stadiumMapX: 127.431303,
                    stadiumMapY: 36.316262,
                    stadiumAddr1: '주소 정보 없음',
                    stadiumAddr2: '',
                    stadiumImagePath: null // 이미지가 없는 경우를 대비
                });
            }
        };
        if (parsedStadiumId) {
            fetchStadiumInfo();
        }
    }, [parsedStadiumId]);

    useEffect(() => {
        if (mapLoaded && stadiumData && kakaoAppKey) {
            initMapWithData(stadiumData);
        }
    }, [mapLoaded, stadiumData, kakaoAppKey]);

    const initMapWithData = (data) => {
        const container = document.getElementById('kakao-map');
        if (!container) {
            console.error('카카오맵 컨테이너를 찾을 수 없습니다.');
            return;
        }

        const centerLng = data.stadiumMapX;
        const centerLat = data.stadiumMapY;
        const stadiumName = data.stadiumName;
        const fullAddress = `${data.stadiumAddr1}`.trim();

        const options = {
            center: new window.kakao.maps.LatLng(centerLat, centerLng),
            level: 3
        };

        const map = new window.kakao.maps.Map(container, options);

        const markerPosition = new window.kakao.maps.LatLng(centerLat, centerLng);
        const marker = new window.kakao.maps.Marker({
            position: markerPosition
        });
        marker.setMap(map);

        const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;width:200px;text-align:center;">
                                <strong>${stadiumName || '경기장 이름'}</strong><br/>
                                ${fullAddress || '주소 정보 없음'}
                            </div>`
        });
        infowindow.open(map, marker);

        window.kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });
    };

    // ======================== 카카오맵 관련 로직 끝 ========================

    // 필터 변경 핸들러
    const handleFilterChange = (filterType, value) => {
        let setStateFunc;
        let selectedValues;

        switch (filterType) {
            case 'infieldOutfield':
                setStateFunc = setSelectedInfieldOutfield;
                selectedValues = selectedInfieldOutfield;
                break;
            case 'base':
                setStateFunc = setSelectedBase;
                selectedValues = selectedBase;
                break;
            case 'floor':
                setStateFunc = setSelectedFloor;
                selectedValues = selectedFloor;
                break;
            default:
                return;
        }

        let newSelectedValues;
        if (selectedValues.includes(value)) {
            newSelectedValues = selectedValues.filter(item => item !== value);
        } else {
            newSelectedValues = [...selectedValues, value];
        }
        setStateFunc(newSelectedValues);

        setCurrentPage(1);
        setCurrentPageGroup(1);
        setShowNoFilterSelectedMessage(false);
    };

    // ======================== 식당 데이터 로딩 로직 ========================
    useEffect(() => {
        const fetchRestaurants = async () => {
            if (selectedInfieldOutfield.length === 0 && selectedBase.length === 0 && selectedFloor.length === 0) {
                setRestaurants([]);
                setTotalPages(1);
                setShowNoFilterSelectedMessage(true);
                return;
            }

            setIsLoading(true);
            try {
                const params = {
                    stadiumId: parsedStadiumId,
                    restaurantInsideFlag: 0,
                    sortBy: 'rating',
                    page: currentPage - 1,
                    size: RESTAURANTS_PER_PAGE
                };

                if (selectedInfieldOutfield.length > 0) {
                    params.infieldOutfield = selectedInfieldOutfield.join(',');
                }
                if (selectedBase.length > 0) {
                    params.base = selectedBase.join(',');
                }
                if (selectedFloor.length > 0) {
                    params.floor = selectedFloor.join(',');
                }

                const response = await axios.get(`http://localhost:18090/api/Stadium/restaurants`, { params });
                console.log('백엔드에서 받은 식당 데이터:', response.data);
                setRestaurants(response.data.content);
                setTotalPages(response.data.totalPages);

                const newCurrentPageGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
                if (newCurrentPageGroup !== currentPageGroup) {
                    setCurrentPageGroup(newCurrentPageGroup);
                }

            } catch (error) {
                console.error('식당 정보를 불러오는 데 실패했습니다:', error);
                setRestaurants([]);
                setTotalPages(1);
            } finally {
                setIsLoading(false);
            }
        };

        if (parsedStadiumId) {
            fetchRestaurants();
        }
    }, [currentPage, parsedStadiumId, currentPageGroup, selectedInfieldOutfield, selectedBase, selectedFloor]);


    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return (
            <>
                {'★'.repeat(fullStars)}
                {halfStar ? '½' : ''}
                {'☆'.repeat(emptyStars)}
            </>
        );
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageGroupChange = (direction) => {
        if (direction === 'next') {
            const nextGroupStartPage = (currentPageGroup * PAGE_GROUP_SIZE) + 1;
            if (nextGroupStartPage <= totalPages) {
                setCurrentPageGroup(prev => prev + 1);
                setCurrentPage(nextGroupStartPage);
            }
        } else if (direction === 'prev') {
            if (currentPageGroup > 1) {
                const prevGroupStartPage = ((currentPageGroup - 2) * PAGE_GROUP_SIZE) + 1;
                setCurrentPageGroup(prev => prev - 1);
                setCurrentPage(Math.max(1, prevGroupStartPage));
            } else {
                setCurrentPage(1);
            }
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        const startPage = ((currentPageGroup - 1) * PAGE_GROUP_SIZE) + 1;
        const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

        if (currentPageGroup > 1) {
            pages.push(
                <span
                    key="prev-group"
                    className="stadium-page-number stadium-page-number-prev-group"
                    onClick={() => handlePageGroupChange('prev')}
                >
                    이전
                </span>
            );
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i > totalPages) break;
            pages.push(
                <span
                    key={i}
                    className={`stadium-page-number ${currentPage === i ? 'current' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </span>
            );
        }

        if (endPage < totalPages) {
            pages.push(
                <span
                    key="next-group"
                    className="stadium-page-number stadium-page-number-next-group"
                    onClick={() => handlePageGroupChange('next')}
                >
                    다음
                </span>
            );
        }
        return pages;
    };

    const openModal = (restaurant) => {
        console.log("모달 열기", restaurant);
        setSelectedRestaurant(restaurant);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRestaurant(null);
    };

    // 이미지 모달 열기 함수
    const openImageModal = (imagePath) => {
        setModalImagePath(`http://localhost:18090${imagePath}`);
        setIsImageModalOpen(true);
    };

    // 이미지 모달 닫기 함수
    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setModalImagePath('');
    };

    // 카카오맵 클릭 핸들러
    const handleMapClick = () => {
        if (stadiumData && stadiumData.stadiumImagePath) {
            openImageModal(stadiumData.stadiumImagePath);
        } else {
            console.log("경기장 사진이 없어 모달을 열 수 없습니다.");
            alert("경기장 내부 사진이 준비되지 않았습니다.");
        }
    };


    return (
        <div className="stadium-page">

            <Header/>

            {/* Stadium Map Section */}
            <section className="stadium-map-section">
                <div className="stadium-container">
                    <h2 className="stadium-map-title">
                        {stadiumData ? stadiumData.stadiumName : '경기장 정보 로딩 중...'}
                    </h2>
                    {stadiumData && stadiumData.stadiumImagePath && (
                        <p className="stadium-map-subtext">클릭 시 구장 내부도 나옴</p>
                    )}

                    <div id="kakao-map" className="stadium-kakao-map" onClick={handleMapClick}>
                        {!kakaoAppKey && <p>카카오 앱 키를 불러오는 중...</p>}
                        {kakaoAppKey && !mapLoaded && <p>카카오맵 SDK 로딩 중...</p>}
                        {mapLoaded && !stadiumData && <p>경기장 정보를 불러오는 중...</p>}
                        {mapLoaded && stadiumData && kakaoAppKey && (
                            <p style={{ display: 'none' }}>지도 로드 완료</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Navigation Tabs - 단일 탭 (구장 먹거리 탭만 남김) */}
            {/* 기존 stadium-nav-tabs-section 대신 admin-tabs-container 사용 */}
            <section className="admin-tabs-container">
                <div className="stadium-container">
                    {/* 단일 탭 버튼 */}
                    <button className="tab-button active">
                        구장 먹거리
                    </button>
                </div>
            </section>

            {/* Restaurant Content */}
            <section className="stadium-restaurant-section">
                <div className="stadium-container">
                    {/* 새로운 블록형 필터 섹션 */}
                    <div className="stadium-new-filter-section">
                        {/* 내야/외야 필터 */}
                        <div className="stadium-filter-group">
                            <span className="stadium-filter-group-title">위치:</span>
                            <div
                                className={`stadium-filter-block ${selectedInfieldOutfield.includes('INFIELD') ? 'active' : ''}`}
                                onClick={() => handleFilterChange('infieldOutfield', 'INFIELD')}
                            >
                                내야
                            </div>
                            <div
                                className={`stadium-filter-block ${selectedInfieldOutfield.includes('OUTFIELD') ? 'active' : ''}`}
                                onClick={() => handleFilterChange('infieldOutfield', 'OUTFIELD')}
                            >
                                외야
                            </div>
                        </div>

                        {/* 1루/3루 필터 */}
                        <div className="stadium-filter-group">
                            <span className="stadium-filter-group-title">방향:</span>
                            <div
                                className={`stadium-filter-block ${selectedBase.includes('FIRST_BASE') ? 'active' : ''}`}
                                onClick={() => handleFilterChange('base', 'FIRST_BASE')}
                            >
                                1루
                            </div>
                            <div
                                className={`stadium-filter-block ${selectedBase.includes('THIRD_BASE') ? 'active' : ''}`}
                                onClick={() => handleFilterChange('base', 'THIRD_BASE')}
                            >
                                3루
                            </div>
                        </div>

                        {/* 층 필터 */}
                        <div className="stadium-filter-group stadium-floor-filter-group">
                            <span className="stadium-filter-group-title">층:</span>
                            {['F1', 'F2', 'F3', 'F4', 'F5'].map(floor => (
                                <div
                                    key={floor}
                                    className={`stadium-filter-block ${selectedFloor.includes(floor) ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('floor', floor)}
                                >
                                    {floor.replace('F', '')}층
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 조건부 렌더링: 로딩, 필터 미선택 메시지, 식당 목록, 데이터 없음 메시지 */}
                    {isLoading ? (
                        <div className="stadium-loading-message">
                            <p>식당 목록을 불러오는 중...</p>
                        </div>
                    ) : showNoFilterSelectedMessage ? (
                        <div className="stadium-no-data-message">
                            <p>원하는 구역의 먹거리를 찾으려면 위 필터를 선택해주세요.</p>
                        </div>
                    ) : restaurants.length > 0 ? (
                        <div className="stadium-restaurant-grid">
                            {restaurants.map(restaurant => (
                                <div key={restaurant.id} className="stadium-restaurant-card" onClick={() => openModal(restaurant)}>
                                    <div className="stadium-restaurant-image">
                                        <img
                                            src={restaurant.restaurantImagePath
                                                ? `http://localhost:18090${restaurant.restaurantImagePath}`
                                                : '/default-restaurant-image.jpg'}
                                            alt={restaurant.restaurantName}className="stadium-restaurant-img"/>
                                    </div>
                                    <div className="stadium-restaurant-info">
                                        <div className="stadium-rating-section">
                                            <div className="stadium-stars">{renderStars(restaurant.rating)}</div>
                                            <div className="stadium-review-count">({restaurant.reviewCount})</div>
                                        </div>
                                        <div className="stadium-restaurant-name">{restaurant.restaurantName}</div>

                                        <div className="stadium-restaurant-location">
                                            <span className="stadium-location-label">구역: </span>
                                            {restaurant.zoneName || ''} <br/>
                                            <span className="stadium-location-label">상세: </span>
                                            {restaurant.restaurantLocation || ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="stadium-no-data-message">
                            <p>선택하신 필터 조건에 맞는 식당이 없습니다.</p>
                        </div>
                    )}

                    {/* 페이지네이션 */}
                    {totalPages > 1 && !showNoFilterSelectedMessage && (
                        <div className="stadium-pagination">
                            <div className="stadium-page-numbers">
                                {renderPageNumbers()}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {isModalOpen && (
                <Restaurant
                    restaurant={selectedRestaurant}
                    onClose={closeModal}
                />
            )}

            {/* 이미지 모달 렌더링 */}
            {isImageModalOpen && (
                <ImageModal
                    imageUrl={modalImagePath}
                    onClose={closeImageModal}
                />
            )}

           <Footer/>
        </div>
    );
};

export default Stadium;
