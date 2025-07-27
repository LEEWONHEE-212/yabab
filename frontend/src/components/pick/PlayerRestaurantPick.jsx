import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PlayerRestaurantPick.css';
import Header from '../common/Header';
import Footer from '../common/Footer';

const PlayerRestaurantPick = () => {
    // 백엔드에서 받아올 데이터를 저장할 상태
    const [foodCategories, setFoodCategories] = useState([]);
    // 데이터 로딩 상태
    const [loading, setLoading] = useState(true);
    // 에러 상태
    const [error, setError] = useState(null);

    // '더보기' 클릭 시 전체 리스트를 보여주는 모달 상태
    const [showAllRestaurantsModal, setShowAllRestaurantsModal] = useState(false);
    const [allRestaurantsModalCategory, setAllRestaurantsModalCategory] = useState(null);

    // '음식점 카드' 클릭 시 추천 이유를 보여주는 모달 상태
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [selectedRestaurantForReason, setSelectedRestaurantForReason] = useState(null);

    // 슬라이더 시작 인덱스 맵 (동적으로 생성되도록 초기화)
    const [startIndexMap, setStartIndexMap] = useState({});

    // 컴포넌트 마운트 시 데이터 불러오기
    useEffect(() => {
        const fetchPlayerPicks = async () => {
            try {
                const response = await axios.get('http://localhost:18090/api/player-picks');
                
                if (response.data === null || !Array.isArray(response.data)) {
                    setFoodCategories([]);
                    setStartIndexMap({});
                    console.warn('Backend did not return valid player pick restaurant data or data is empty (204 No Content).', response.data);
                } else {
                    setFoodCategories(response.data); 
                    const initialStartIndexMap = response.data.reduce((acc, category) => {
                        acc[category.id] = 0;
                        return acc;
                    }, {});
                    setStartIndexMap(initialStartIndexMap);
                }

            } catch (err) {
                console.error("Error fetching player picks:", err);
                setError("데이터를 불러오는 데 실패했습니다.");
                if (err.response && err.response.status) {
                    setError(`데이터를 불러오는 데 실패했습니다. (상태 코드: ${err.response.status})`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerPicks();
    }, []);

    // Function to handle moving to the previous set of restaurants
    const handlePrevClick = (categoryId) => {
        setStartIndexMap(prevMap => {
            const currentStartIndex = prevMap[categoryId] || 0;
            const category = foodCategories.find(cat => cat.id === categoryId);
            const totalRestaurants = category ? category.restaurants.length : 0;
            if (totalRestaurants === 0) return prevMap;

            const newStartIndex = (currentStartIndex - 4 + totalRestaurants) % totalRestaurants;
            return { ...prevMap, [categoryId]: newStartIndex };
        });
    };

    // Function to handle moving to the next set of restaurants
    const handleNextClick = (categoryId) => {
        setStartIndexMap(prevMap => {
            const currentStartIndex = prevMap[categoryId] || 0;
            const category = foodCategories.find(cat => cat.id === categoryId);
            const totalRestaurants = category ? category.restaurants.length : 0;
            if (totalRestaurants === 0) return prevMap;

            const newStartIndex = (currentStartIndex + 4) % totalRestaurants;
            return { ...prevMap, [categoryId]: newStartIndex };
        });
    };

    // Function to handle "More" button click for a category
    const handleMoreClick = (category) => {
        setAllRestaurantsModalCategory(category);
        setShowAllRestaurantsModal(true);
    };

    // Function to close the "All Restaurants" modal
    const handleCloseAllRestaurantsModal = () => {
        setShowAllRestaurantsModal(false);
        setAllRestaurantsModalCategory(null);
    };

    // Function to handle restaurant card click (for reason modal)
    const handleRestaurantCardClick = (restaurant, category) => {
        setSelectedRestaurantForReason({
            ...restaurant,
            youtubeChannel: category.youtubeChannel // Pass YouTube channel info to reason modal
        });
        setShowReasonModal(true);
    };

    // Function to close the reason modal
    const handleCloseReasonModal = () => {
        setShowReasonModal(false);
        setSelectedRestaurantForReason(null);
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="player-restaurant-page-wrapper">
                    <div className="player-restaurant-page-container">
                        <h1 className="page-title">선수 추천 맛집</h1>
                        <p>데이터를 불러오는 중입니다...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="player-restaurant-page-wrapper">
                    <div className="player-restaurant-page-container">
                        <h1 className="page-title">선수 추천 맛집</h1>
                        <p className="error-message">{error}</p>
                    </div>
                </div>
            </>
        );
    }

    if (!foodCategories || foodCategories.length === 0) {
        return (
            <>
                <Header />
                <div className="player-restaurant-page-wrapper">
                    <div className="player-restaurant-page-container">
                        <h1 className="page-title">선수 추천 맛집</h1>
                        <p>추천된 맛집 정보가 없습니다.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header/>
            <div className="player-restaurant-page-wrapper">
                <div className="player-restaurant-page-container">
                    <h1 className="page-title">선수 추천 맛집</h1>

                    {foodCategories.map(category => {
                        const startIndex = startIndexMap[category.id] !== undefined ? startIndexMap[category.id] : 0;
                        
                        const totalRestaurants = category.restaurants ? category.restaurants.length : 0;
                        const isNavigatingNeeded = totalRestaurants > 4;

                        let visibleRestaurants = [];
                        if (totalRestaurants > 0) {
                            if (isNavigatingNeeded) {
                                for (let i = 0; i < 4; i++) {
                                    visibleRestaurants.push(category.restaurants[(startIndex + i) % totalRestaurants]);
                                }
                            } else {
                                visibleRestaurants = category.restaurants;
                            }
                        }
                        
                        console.log(`Category: ${category.name}, Visible Restaurants:`, visibleRestaurants);

                        return (
                            <div key={category.id} className="food-category-section">
                                <div className="category-header">
                                    <h2 className="category-title">{category.name}</h2>
                                    {totalRestaurants > 4 && (
                                        <button className="more-button" onClick={() => handleMoreClick(category)}>
                                            더보기
                                        </button>
                                    )}
                                </div>

                                <div className="restaurant-list-wrapper">
                                    {isNavigatingNeeded && (
                                        <button
                                            className="nav-button prev-button"
                                            onClick={() => handlePrevClick(category.id)}
                                        >
                                            &lt;
                                        </button>
                                    )}

                                    <div className="restaurant-list">
                                        {visibleRestaurants.length > 0 ? (
                                            visibleRestaurants.map(restaurant => {
                                                // 백엔드에서 받은 경로를 새 웹 경로에 맞게 변환
                                                const correctedImagePath = restaurant.image.replace('/restaurant-images/', '/uploads/');
                                                const imageUrl = `http://localhost:18090${correctedImagePath}`;
                                                console.log(`Restaurant: ${restaurant.name}, Original Path: ${restaurant.image}, Corrected Path: ${imageUrl}`);
                                                return (
                                                    <div 
                                                        key={`${restaurant.id}-${restaurant.player}`} 
                                                        className="restaurant-card"
                                                        onClick={() => handleRestaurantCardClick(restaurant, category)} 
                                                    >
                                                        <img
                                                            src={imageUrl} // 변환된 전체 URL 사용
                                                            alt={restaurant.name}
                                                            className="restaurant-card-image"
                                                            onError={(e) => { 
                                                                e.target.onerror = null; 
                                                                e.target.src = '/assets/default-food.png'; 
                                                                console.error(`Image failed to load for ${restaurant.name}. Path: ${imageUrl}`);
                                                            }} 
                                                        />
                                                        <p className="restaurant-card-name">{restaurant.name}</p>
                                                        {restaurant.player && <p className="restaurant-player-pick">{restaurant.player} Pick</p>}
                                                        {category.youtubeChannel && (
                                                            <p className="restaurant-source">
                                                                출처: <a
                                                                    href={category.youtubeChannel.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="source-link"
                                                                    onClick={e => e.stopPropagation()} 
                                                                >
                                                                    {category.youtubeChannel.name}
                                                                </a>
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="no-restaurants-message">아직 등록된 맛집이 없습니다.</p>
                                        )}
                                    </div>

                                    {isNavigatingNeeded && (
                                        <button
                                            className="nav-button next-button"
                                            onClick={() => handleNextClick(category.id)}
                                        >
                                            &gt;
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {showAllRestaurantsModal && allRestaurantsModalCategory && (
                        <div className="modal-overlay" onClick={handleCloseAllRestaurantsModal}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <button className="modal-close-button" onClick={handleCloseAllRestaurantsModal}>×</button>
                                <h2 className="modal-title">{allRestaurantsModalCategory.name} 추천 맛집</h2>
                                <div className="modal-restaurant-list">
                                    {allRestaurantsModalCategory.restaurants && allRestaurantsModalCategory.restaurants.length > 0 ? (
                                        allRestaurantsModalCategory.restaurants.map(restaurant => (
                                            <div 
                                                key={`${restaurant.id}-${restaurant.player}`} 
                                                className="restaurant-card modal-card"
                                                onClick={() => handleRestaurantCardClick(restaurant, allRestaurantsModalCategory)} 
                                            >
                                                <img
                                                    src={`http://localhost:18090${restaurant.image.replace('/restaurant-images/', '/uploads/')}`} // <-- 이 부분을 수정했습니다!
                                                    alt={restaurant.name}
                                                    className="restaurant-card-image"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/assets/default-food.png'; }}
                                                />
                                                <p className="restaurant-card-name">{restaurant.name}</p>
                                                {restaurant.player && <p className="restaurant-player-pick">{restaurant.player} Pick</p>}
                                                {allRestaurantsModalCategory.youtubeChannel && (
                                                    <p className="restaurant-source">
                                                        출처: <a
                                                            href={allRestaurantsModalCategory.youtubeChannel.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="source-link"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            {allRestaurantsModalCategory.youtubeChannel.name}
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-restaurants-message">아직 등록된 맛집이 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {showReasonModal && selectedRestaurantForReason && (
                        <div className="modal-overlay" onClick={handleCloseReasonModal}>
                            <div className="modal-content reason-modal-content" onClick={e => e.stopPropagation()}>
                                <button className="modal-close-button" onClick={handleCloseReasonModal}>×</button>
                                <h2 className="modal-title">{selectedRestaurantForReason.name}</h2>
                                <div className="reason-modal-body">
                                    <img
                                        src={`http://localhost:18090${selectedRestaurantForReason.image.replace('/restaurant-images/', '/uploads/')}`} // <-- 이 부분을 수정했습니다!
                                        alt={selectedRestaurantForReason.name}
                                        className="reason-modal-image"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/assets/default-food.png'; }}
                                    />
                                    <p className="reason-modal-player-pick">{selectedRestaurantForReason.player} 선수 추천!</p>
                                    <p className="reason-modal-text">{selectedRestaurantForReason.reason}</p>
                                    {selectedRestaurantForReason.youtubeChannel && (
                                        <p className="reason-modal-source">
                                            출처: <a
                                                href={selectedRestaurantForReason.youtubeChannel.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="source-link"
                                            >
                                                {selectedRestaurantForReason.youtubeChannel.name}
                                            </a>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default PlayerRestaurantPick;
