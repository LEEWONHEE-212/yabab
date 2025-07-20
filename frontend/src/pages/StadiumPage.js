import React, { useState, useEffect } from 'react';
import './StadiumPage.css';
import RestaurantPage from './RestaurantPage';

const StadiumPage = () => {
  const [activeTab, setActiveTab] = useState('facility'); // 기본값을 시설소개로 변경
  const [selectedFilter, setSelectedFilter] = useState('rating');
  const [activeSubTab, setActiveSubTab] = useState('inside');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageGroup, setCurrentPageGroup] = useState(1); // 1: 1-10페이지, 2: 11-20페이지
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // 카카오맵 API 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=86a28661813c44dd1f70c5c9543b3da3&autoload=false`;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        setMapLoaded(true);
        initMap();
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 카카오맵 초기화
  const initMap = () => {
    const container = document.getElementById('kakao-map');
    if (!container) return;

    const options = {
      center: new window.kakao.maps.LatLng(36.31615273951669, 127.43152938414454), // 대전한화생명볼파크 좌표
      level: 3
    };

    const map = new window.kakao.maps.Map(container, options);

    // 마커 추가
    const markerPosition = new window.kakao.maps.LatLng(36.31615273951669, 127.43152938414454);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition
    });
    marker.setMap(map);

    // 인포윈도우 추가
    const infowindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:5px;font-size:12px;width:150px;text-align:center;">대전한화생명볼파크</div>'
    });
    infowindow.open(map, marker);
  };

  // 시설 소개 데이터
  const facilityData = {
    name: '대전한화생명볼파크',
    description: '',
    capacity: '',
    location: '서울특별시 마포구 월드컵로 240',
    facilities: [
      '',
    ],
    openingHours: '',
    contact: ''
  };

  // 맛집 데이터 (구장 내부/외부 구분)
  const restaurantData = {
    inside: [
      {
        id: 1,
        name: '스파이시 핫도그',
        location: '위치: 1층 서측 매점',
        rating: 4,
        reviews: 125,
        type: 'inside'
      },
      {
        id: 2,
        name: '치킨 & 비어',
        location: '위치: 2층 북측 푸드코트',
        rating: 4,
        reviews: 98,
        type: 'inside'
      },
      {
        id: 3,
        name: '김밥천국',
        location: '위치: 지하 1층 매점가',
        rating: 3,
        reviews: 67,
        type: 'inside'
      },
      {
        id: 4,
        name: '버거킹',
        location: '위치: 1층 동측 매점',
        rating: 4,
        reviews: 156,
        type: 'inside'
      },
      {
        id: 5,
        name: '피자헛',
        location: '위치: 2층 VIP 라운지',
        rating: 5,
        reviews: 89,
        type: 'inside'
      },
      {
        id: 6,
        name: '스타벅스',
        location: '위치: 1층 메인 로비',
        rating: 4,
        reviews: 234,
        type: 'inside'
      }
    ],
    outside: [
      {
        id: 7,
        name: '마포갈매기',
        location: '위치: 경기장 정문 앞 200m',
        rating: 5,
        reviews: 312,
        type: 'outside'
      },
      {
        id: 8,
        name: '홍대 쭈꾸미',
        location: '위치: 월드컵로 건너편',
        rating: 4,
        reviews: 178,
        type: 'outside'
      },
      {
        id: 9,
        name: '맘스터치',
        location: '위치: 지하철 6호선 출구 근처',
        rating: 4,
        reviews: 145,
        type: 'outside'
      },
      {
        id: 10,
        name: '백종원의 본가',
        location: '위치: 상암동 DMC 타워',
        rating: 5,
        reviews: 267,
        type: 'outside'
      },
      {
        id: 11,
        name: '신전떡볶이',
        location: '위치: 경기장 후문 50m',
        rating: 3,
        reviews: 98,
        type: 'outside'
      }
    ]
  };

  // 현재 표시할 맛집 데이터
  const getCurrentRestaurants = () => {
    const restaurants = restaurantData[activeSubTab];
    
    // 필터링 적용
    let filteredRestaurants = [...restaurants];
    
    switch (selectedFilter) {
      case 'rating':
        filteredRestaurants.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        // 거리순 정렬 (임의로 id 순으로 정렬)
        filteredRestaurants.sort((a, b) => a.id - b.id);
        break;
      case 'reviews':
        filteredRestaurants.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        break;
    }
    
    return filteredRestaurants;
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // 페이지네이션 처리
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 페이지 그룹 변경 (이전/다음)
  const handlePageGroupChange = (direction) => {
    if (direction === 'next' && currentPageGroup === 1) {
      setCurrentPageGroup(2);
      setCurrentPage(11);
    } else if (direction === 'prev' && currentPageGroup === 2) {
      setCurrentPageGroup(1);
      setCurrentPage(1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const startPage = currentPageGroup === 1 ? 1 : 11;
    const endPage = currentPageGroup === 1 ? 10 : 20;
    
    // 이전 버튼 (2번째 그룹에서만 표시)
    if (currentPageGroup === 2) {
      pages.push(
        <span 
          key="prev" 
          className="page-number prev"
          onClick={() => handlePageGroupChange('prev')}
        >
          이전
        </span>
      );
    }
    
    // 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <span 
          key={i}
          className={`page-number ${currentPage === i ? 'current' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </span>
      );
    }
    
    // 다음 버튼 (1번째 그룹에서만 표시)
    if (currentPageGroup === 1) {
      pages.push(
        <span 
          key="next" 
          className="page-number next"
          onClick={() => handlePageGroupChange('next')}
        >
          다음
        </span>
      );
    }
    
    return pages;
  };

  // 현재 페이지에 따른 데이터 표시 여부
  const shouldShowData = () => {
    return currentPage === 1;
  };

  // 모달 열기
  const openModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  return (
    <div className="stadium-page">
      {/* Header */}
      <header className="main-header">
        <div className="header-container">

          <div className="header-left">
            <img src="./yabab-logo.png" alt="로고" />
          </div>

          <nav className="header-center">
            <a href="#">홈</a>
            <a href="#">응원피드</a>
            <a href="#">선수 추천 맛집</a>
            <a href="#">마이페이지</a>
          </nav>

          <div className="header-right">
            <a href="#">로그인</a>
          </div>

        </div>
      </header>

      {/* Kakao Map Section */}
      <section className="map-section">
        <div className="container">
          <div id="kakao-map" className="kakao-map"></div>
          <div className="location-marker">
            <div className="marker-pin"></div>
          </div>
        </div>
      </section>

      {/* Stadium Image Section */}
      <section className="stadium-image-section">
        <div className="container">
          <div className="stadium-image-container">
            <div className="stadium-image">
              <span>구장 이미지</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="nav-tabs-section">
        <div className="container">
          <div className="main-tabs">
            <button 
              className={`tab-btn ${activeTab === 'facility' ? 'active' : ''}`}
              onClick={() => setActiveTab('facility')}
            >
              시설 소개
            </button>
            <button 
              className={`tab-btn ${activeTab === 'restaurant' ? 'active' : ''}`}
              onClick={() => setActiveTab('restaurant')}
            >
              주변 맛집
            </button>
          </div>
        </div>
      </section>

      {/* Facility Content */}
      {activeTab === 'facility' && (
        <section className="facility-section">
          <div className="container">
            <div className="facility-content">
              <div className="facility-header">
                <h2>{facilityData.name}</h2>
                <p className="facility-description">{facilityData.description}</p>
              </div>
              
              <div className="facility-details">
                <div className="detail-row">
                  <span className="label">수용 인원:</span>
                  <span className="value">{facilityData.capacity}</span>
                </div>
                <div className="detail-row">
                  <span className="label">위치:</span>
                  <span className="value">{facilityData.location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">운영 시간:</span>
                  <span className="value">{facilityData.openingHours}</span>
                </div>
                <div className="detail-row">
                  <span className="label">연락처:</span>
                  <span className="value">{facilityData.contact}</span>
                </div>
              </div>

              <div className="facility-amenities">
                <h3>시설 정보</h3>
                <ul className="amenities-list">
                  {facilityData.facilities.map((facility, index) => (
                    <li key={index}>{facility}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Restaurant Content */}
      {activeTab === 'restaurant' && (
        <section className="restaurant-section">
          <div className="container">
            {/* Sub Navigation */}
            <div className="sub-nav">
              <button 
                className={`sub-tab-btn ${activeSubTab === 'inside' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('inside')}
              >
                구장 내부 맛집
              </button>
              <div className="divider"></div>
              <button 
                className={`sub-tab-btn ${activeSubTab === 'outside' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('outside')}
              >
                구장 외부 맛집
              </button>
            </div>

            {/* Filter Options */}
            <div className="filter-section">
              <div className="filter-options">
                <label className="radio-option">
                  <input 
                    type="radio" 
                    name="filter" 
                    value="rating"
                    checked={selectedFilter === 'rating'}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  />
                  <span>별점순</span>
                </label>
                <label className="radio-option">
                  <input 
                    type="radio" 
                    name="filter" 
                    value="distance"
                    checked={selectedFilter === 'distance'}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  />
                  <span>가까운순</span>
                </label>
                <label className="radio-option">
                  <input 
                    type="radio" 
                    name="filter" 
                    value="reviews"
                    checked={selectedFilter === 'reviews'}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  />
                  <span>리뷰 많은순</span>
                </label>
              </div>
            </div>

            {/* Restaurant Grid */}
            {shouldShowData() ? (
              <div className="restaurant-grid">
                {getCurrentRestaurants().map(restaurant => (
                  <div key={restaurant.id} className="restaurant-card" onClick={() => openModal(restaurant)}>
                    <div className="restaurant-image">
                      <div className="image-placeholder"></div>
                    </div>
                    <div className="restaurant-info">
                      <div className="rating-section">
                        <div className="stars">{renderStars(restaurant.rating)}</div>
                        <div className="rating-text">별점: {restaurant.rating}점 (참여: {restaurant.reviews}명)</div>
                      </div>
                      <div className="restaurant-name">{restaurant.name}</div>
                      <div className="restaurant-location">{restaurant.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data-message">
                <p>데이터가 없습니다</p>
              </div>
            )}

            {/* Pagination */}
            <div className="pagination">
              <div className="page-numbers">
                {renderPageNumbers()}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="stadium-footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2024 Stadium Info. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 모달 */}
      <RestaurantPage 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        restaurant={selectedRestaurant}
      />
    </div>
  );
};

export default StadiumPage;
