import React, { useState } from 'react';
import './PlayerRestaurantPick.css';
import Header from '../common/Header';

const foodCategories = [
    {
        id: 'HanwhaEagles',
        name: '한화 이글스',
        youtubeChannel: { name: '한화이글스 TV', url: 'https://www.youtube.com/@hanwhaeagles' },
        restaurants: [
            { id: 1, name: '농민백암순대 본점', image: 'https://placehold.co/150x150/E0E0E0/333333?text=순대국1', player: '최재훈', reason: '국물이 진하고 고기가 부드러워서 해장으로 최고입니다. 선수들이 자주 찾는 숨은 맛집이에요!' },
            { id: 2, name: '함경도찹쌀순대', image: 'https://placehold.co/150x150/E0E0E0/333333?text=순대국2', player: '노시환', reason: '찹쌀순대가 정말 쫀득하고 맛있습니다. 비 오는 날 뜨끈한 순대국에 막걸리 한 잔이면 피로가 싹 풀려요.' },
            { id: 3, name: '청와옥 본점', image: 'https://placehold.co/150x150/E0E0E0/333333?text=순대국3', player: '문동주', reason: '깔끔하고 정갈한 맛이 일품입니다. 특히 얼큰 순대국은 훈련 후 땀 흘리고 먹으면 정말 개운해요.' },
            { id: 4, name: '농민백암순대 시청직영점', image: 'https://placehold.co/150x150/E0E0E0/333333?text=순대국4', player: '류현진', reason: '본점 못지않은 맛과 깔끔한 분위기! 시청 근처라 접근성도 좋고, 늘 한결같은 맛을 유지합니다.' },
            { id: 5, name: '청와옥 석촌호수직영점', image: 'https://placehold.co/150x150/E0E0E0/333333?text=순대국5', player: '채은성', reason: '석촌호수 뷰를 보며 맛있는 순대국을 즐길 수 있어요. 데이트 코스로도 추천합니다.' },
            { id: 6, name: '제일순대', image: 'https://placehold.co/150x150/E0E0E0/333333?text=순대국6', player: '김태연', reason: '할머니 손맛이 느껴지는 정겨운 순대국집입니다. 양도 푸짐하고 국물이 끝내줘요!' },
            { id: 7, name: '담소사골순대', image: 'https://placehold.co/150x150/E0E0E0/333333?text=순대국7', player: '정은원', reason: '프랜차이즈지만 맛은 최고! 언제 어디서든 믿고 먹을 수 있는 순대국입니다. 혼밥하기도 좋아요.' },
            { id: 8, name: '백암왕순대', image: 'https://placehold.co/150x150/E0E0E0/333333?text=순대국8', player: '이진영', reason: '전통 백암순대의 깊은 맛을 느낄 수 있습니다. 잡내 없이 깔끔해서 초보자도 즐길 수 있어요.' },
            { id: 9, name: '병천순대', image: 'https://placehold.co/150x150/E0E0E0/333333?text=순대국9', player: '박상언', reason: '충남 천안의 명물 병천순대의 맛을 서울에서! 쫄깃한 순대와 구수한 국물이 환상적입니다.' },
            { id: 10, name: '수요미식회 순대국', image: 'https://placehold.co/150x150/E0E0E0/333333?text=순대국10', player: '장시환', reason: '방송에도 나온 유명 맛집! 기다림이 아깝지 않은 맛입니다. 특별한 날 방문하기 좋아요.' },
        ]
    },
    {
        id: 'KtWiz',
        name: 'Kt 위즈',
        youtubeChannel: { name: 'KT 위즈 TV', url: 'https://www.youtube.com/@ktwiztv' },
        restaurants: [
            { id: 11, name: '우래옥 본점', image: 'https://placehold.co/150x150/E0E0E0/333333?text=냉면1', player: '강백호', reason: '평양냉면의 정석! 슴슴하면서도 깊은 육수 맛이 일품입니다. 한 번 맛보면 잊을 수 없어요.' },
            { id: 12, name: '진미평양냉면', image: 'https://placehold.co/150x150/E0E0E0/333333?text=냉면2', player: '고영표', reason: '강남에서 평양냉면하면 여기죠! 깔끔하고 시원해서 여름철 더위를 한 방에 날려줍니다.' },
            { id: 13, name: '을밀대 본점', image: 'https://placehold.co/150x150/E0E0E0/333333?text=냉면3', player: '박병호', reason: '새콤달콤한 비빔냉면도 맛있지만, 역시 물냉면은 을밀대! 면발의 쫄깃함이 살아있어요.' },
            { id: 14, name: '평양면옥 본점', image: 'https://placehold.co/150x150/E0E0E0/333333?text=냉면4', player: '황재균', reason: '의정부 평양면옥 계보를 잇는 맛집! 육향 가득한 육수와 부드러운 면발이 조화를 이룹니다.' },
            { id: 15, name: '서복면옥', image: 'https://placehold.co/150x150/E0E0E0/333333?text=냉면5', player: '소형준', reason: '숨겨진 냉면 강자! 갈비찜과 함께 먹으면 더 맛있습니다. 점심시간에는 줄이 길어요.' },
            { id: 16, name: '정인면옥', image: 'https://placehold.co/150x150/E0E0E0/333333?text=냉면6', player: '김민혁', reason: '육수가 정말 예술입니다. 냉면 초보자도 맛있게 즐길 수 있는 깔끔한 맛이에요.' },
            { id: 17, name: '봉피양 방이점', image: 'https://placehold.co/150x150/E0E0E0/333333?text=냉면7', player: '배정대', reason: '프리미엄 한우 평양냉면! 가격은 좀 있지만 그만큼의 가치를 합니다. 고기랑 같이 먹으면 더욱 풍부한 맛을 느낄 수 있어요.' },
            { id: 18, name: '능라도 판교점', image: 'https://placehold.co/150x150/E0E0E0/333333?text=냉면8', player: '장성우', reason: '판교에서 평양냉면을 찾는다면 능라도! 깔끔하고 정갈한 분위기에서 제대로 된 냉면을 맛볼 수 있습니다.' },
            { id: 19, name: '필동면옥', image: 'https://placehold.co/150x150/E0E0E0/333333?text=냉면9', player: '주권', reason: '을지로의 오래된 노포 냉면집. 투박하지만 깊이 있는 맛이 매력적입니다. 만두도 꼭 시켜보세요.' },
            { id: 20, name: '만정', image: 'https://placehold.co/150x150/E0E0E0/333333?text=냉면10', player: '박경수', reason: '담백하고 시원한 육수에 부드러운 면발이 최고입니다. 더운 날 한 그릇 뚝딱하면 힘이 솟아요!' },
        ]
    },
];

const PlayerRestaurantPick = () => {
    // '더보기' 클릭 시 전체 리스트를 보여주는 모달 상태
    const [showAllRestaurantsModal, setShowAllRestaurantsModal] = useState(false);
    const [allRestaurantsModalCategory, setAllRestaurantsModalCategory] = useState(null);

    // '음식점 카드' 클릭 시 추천 이유를 보여주는 모달 상태
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [selectedRestaurantForReason, setSelectedRestaurantForReason] = useState(null);

    const [startIndexMap, setStartIndexMap] = useState(
        foodCategories.reduce((acc, category) => {
            acc[category.id] = 0;
            return acc;
        }, {})
    );

    // 슬라이더 다음 버튼
    const handleNextClick = (categoryId) => {
        setStartIndexMap(prevState => {
            const currentStartIndex = prevState[categoryId];
            const category = foodCategories.find(cat => cat.id === categoryId);
            const totalRestaurants = category.restaurants.length;
            const nextStartIndex = currentStartIndex + 4;

            if (nextStartIndex >= totalRestaurants) {
                return { ...prevState, [categoryId]: 0 }; // 처음으로 돌아감 (순환)
            } else {
                return { ...prevState, [categoryId]: nextStartIndex };
            }
        });
    };

    // 슬라이더 이전 버튼
    const handlePrevClick = (categoryId) => {
        setStartIndexMap(prevState => {
            const currentStartIndex = prevState[categoryId];
            const category = foodCategories.find(cat => cat.id === categoryId);
            const totalRestaurants = category.restaurants.length;
            const prevStartIndex = currentStartIndex - 4;

            if (prevStartIndex < 0) {
                const lastPageStartIndex = Math.floor((totalRestaurants - 1) / 4) * 4;
                return { ...prevState, [categoryId]: lastPageStartIndex }; // 마지막 페이지로 돌아감 (순환)
            } else {
                return { ...prevState, [categoryId]: prevStartIndex };
            }
        });
    };

    // '더보기' 버튼 클릭 핸들러
    const handleMoreClick = (category) => {
        setAllRestaurantsModalCategory(category);
        setShowAllRestaurantsModal(true);
    };

    // '더보기' 모달 닫기 핸들러
    const handleCloseAllRestaurantsModal = () => {
        setShowAllRestaurantsModal(false);
        setAllRestaurantsModalCategory(null);
    };

    // 음식점 카드 클릭 핸들러 (추천 이유 모달 열기)
    const handleRestaurantCardClick = (restaurant, category) => {
        setSelectedRestaurantForReason({ ...restaurant, youtubeChannel: category.youtubeChannel }); // 선택된 식당 정보와 해당 카테고리의 유튜브 채널 정보 함께 저장
        setShowReasonModal(true);
    };

    // 추천 이유 모달 닫기 핸들러
    const handleCloseReasonModal = () => {
        setShowReasonModal(false);
        setSelectedRestaurantForReason(null);
    };

    return (
        <>
        <Header/>
        <div className="player-restaurant-page-wrapper">
            <div className="player-restaurant-page-container">
                <h1 className="page-title">선수 추천 맛집</h1>

                {foodCategories.map(category => {
                    const startIndex = startIndexMap[category.id];
                    // 순환 로직을 위해 visibleRestaurants 계산 방식 변경 (modulo 연산 사용)
                    const tempRestaurants = [];
                    for (let i = 0; i < 4; i++) {
                        tempRestaurants.push(category.restaurants[(startIndex + i) % category.restaurants.length]);
                    }
                    const visibleRestaurants = tempRestaurants;
                    
                    const totalRestaurants = category.restaurants.length;
                    const isNavigatingNeeded = totalRestaurants > 4; // 4개 초과일 때만 네비게이션 필요

                    return (
                        <div key={category.id} className="food-category-section">
                            <div className="category-header">
                                <h2 className="category-title">{category.name}</h2>
                                {isNavigatingNeeded && (
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
                                    {visibleRestaurants.map(restaurant => (
                                        <div 
                                            key={restaurant.id} 
                                            className="restaurant-card"
                                            onClick={() => handleRestaurantCardClick(restaurant, category)} // 클릭 이벤트 추가
                                        >
                                            <img
                                                src={restaurant.image}
                                                alt={restaurant.name}
                                                className="restaurant-card-image"
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/assets/default-food.png'; }} // 이미지 로드 실패 시 대체 이미지
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
                                                        onClick={e => e.stopPropagation()} // 링크 클릭 시 모달 열림 방지
                                                    >
                                                        {category.youtubeChannel.name}
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                    ))}
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

                {/* '더보기' 클릭 시 전체 리스트를 보여주는 모달 */}
                {showAllRestaurantsModal && allRestaurantsModalCategory && (
                    <div className="modal-overlay" onClick={handleCloseAllRestaurantsModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close-button" onClick={handleCloseAllRestaurantsModal}>&times;</button>
                            <h2 className="modal-title">{allRestaurantsModalCategory.name} 추천 맛집</h2>
                            <div className="modal-restaurant-list">
                                {allRestaurantsModalCategory.restaurants.map(restaurant => (
                                    <div 
                                        key={restaurant.id} 
                                        className="restaurant-card modal-card"
                                        onClick={() => handleRestaurantCardClick(restaurant, allRestaurantsModalCategory)} // 모달 내 카드 클릭 시 추천 이유 모달 열기
                                    >
                                        <img
                                            src={restaurant.image}
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
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 새로 추가된 추천 이유 모달 */}
                {showReasonModal && selectedRestaurantForReason && (
                    <div className="modal-overlay" onClick={handleCloseReasonModal}>
                        <div className="modal-content reason-modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close-button" onClick={handleCloseReasonModal}>&times;</button>
                            <h2 className="modal-title">{selectedRestaurantForReason.name}</h2>
                            <div className="reason-modal-body">
                                <img
                                    src={selectedRestaurantForReason.image}
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
        </>
    );
};

export default PlayerRestaurantPick;