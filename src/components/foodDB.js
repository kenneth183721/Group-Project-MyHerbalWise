import React, { useState, useEffect } from 'react';
import foodData from '../json/foodDB.json';
import foodCatData from '../json/foodCat.json';
import placeHolderImg from '../image/PlaceholderImage.png';
import UserSavedFoodAPI from '../services/userSavedFoodAPI';
import saveFoodImg from '../image/saveFood.svg';
import { useToast } from './ToastProvider';
import '../css/components/foodDB.css';

function FoodDB({ isLoggedIn = false, currentUser = null }) {
    const toast = useToast();
    const [filteredFoods, setFilteredFoods] = useState(foodData);
    const [activeCategory, setActiveCategory] = useState('all');
    const [displayCount, setDisplayCount] = useState(12); // Show 12 items initially
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [savedFoods, setSavedFoods] = useState(new Set());
    const [newlyAddedCards, setNewlyAddedCards] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);

    // Mock current user (you can replace this with actual user data)
    const mockUser = currentUser || { userID: 'uid01' };

    // Helper function to get food image path
    const getFoodImagePath = (food) => {
        if (food.foodCatImg) {
            try {
                return require(`../image/food/${food.foodCatImg}`);
            } catch (error) {
                console.warn(`Image not found: ${food.foodCatImg}`, error);
                return placeHolderImg;
            }
        }
        return placeHolderImg;
    };

    // Load saved foods for current user
    useEffect(() => {
        const loadSavedFoods = async () => {
            // Don't make API calls if user is not logged in or user data is not available
            if (!isLoggedIn || !mockUser || !mockUser.userID) {
                console.log('User not logged in or invalid user data:', { isLoggedIn, mockUser });
                setSavedFoods(new Set());
                return;
            }

            try {
                console.log('Loading saved foods for user:', mockUser.userID);
                const savedFoodIds = await UserSavedFoodAPI.getUserSavedFoodIds(mockUser.userID);
                console.log('Loaded saved food IDs:', savedFoodIds);
                setSavedFoods(new Set(savedFoodIds));
            } catch (error) {
                console.error('Failed to load saved foods:', error);
                
                // Only show toast notifications for logged-in users
                if (isLoggedIn && mockUser) {
                    toast.error('載入已保存食物失敗，請稍後重試');
                }
                
                // Fallback to empty set if API fails
                setSavedFoods(new Set());
            }
        };

        loadSavedFoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, mockUser?.userID, toast]);

    // Save food function
    const handleSaveFood = async (foodID) => {
        if (!isLoggedIn || !mockUser) {
            toast.warning('請先登入以保存食物');
            return;
        }

        try {
            if (savedFoods.has(foodID)) {
                // Remove from saved (unsave)
                const result = await UserSavedFoodAPI.unsaveFood(mockUser.userID, foodID);
                
                if (result.success) {
                    const updatedSavedFoods = new Set(savedFoods);
                    updatedSavedFoods.delete(foodID);
                    setSavedFoods(updatedSavedFoods);
                    toast.success('已取消收藏');
                } else if (result.notFound) {
                    // Item wasn't saved anyway, just update state
                    const updatedSavedFoods = new Set(savedFoods);
                    updatedSavedFoods.delete(foodID);
                    setSavedFoods(updatedSavedFoods);
                    toast.success('已取消收藏');
                }
            } else {
                // Add to saved
                const result = await UserSavedFoodAPI.saveFood(mockUser.userID, foodID);
                
                if (result.success) {
                    const updatedSavedFoods = new Set(savedFoods);
                    updatedSavedFoods.add(foodID);
                    setSavedFoods(updatedSavedFoods);
                    toast.success('已加入收藏');
                } else if (result.duplicate) {
                    // Item was already saved, just update state
                    const updatedSavedFoods = new Set(savedFoods);
                    updatedSavedFoods.add(foodID);
                    setSavedFoods(updatedSavedFoods);
                    toast.success('已加入收藏');
                }
            }
        } catch (error) {
            console.error('Error saving food:', error);
            toast.error('操作失敗，請檢查網路連接或稍後再試');
        }
    };

    // Apply both category and search filters
    const applyFilters = (categoryID = activeCategory, searchText = searchTerm) => {
        let filtered = foodData;

        // Apply category filter
        if (categoryID !== 'all') {
            filtered = filtered.filter(food => food.foodCatID === categoryID);
        }

        // Apply search filter
        if (searchText.trim() !== '') {
            filtered = filtered.filter(food =>
                food.foodName.toLowerCase().includes(searchText.toLowerCase()) ||
                food.foodEffect.toLowerCase().includes(searchText.toLowerCase()) ||
                food.foodDescription.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredFoods(filtered);
        setDisplayCount(12); // Reset display count when filtering
    };

    // Filter foods by category
    const filterByCategory = (categoryID) => {
        setActiveCategory(categoryID);
        applyFilters(categoryID, searchTerm);
    };

    // Handle search input
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Generate suggestions
        if (value.trim().length > 0) {
            const searchSuggestions = foodData
                .filter(food =>
                    food.foodName.toLowerCase().includes(value.toLowerCase())
                )
                .slice(0, 8) // Limit to 8 suggestions
                .map(food => food.foodName);

            setSuggestions([...new Set(searchSuggestions)]); // Remove duplicates
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }

        applyFilters(activeCategory, value);
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
        applyFilters(activeCategory, suggestion);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
        setShowSuggestions(false);
        setSuggestions([]);
        applyFilters(activeCategory, '');
    };

    // Load more items
    const loadMore = () => {
        const currentDisplayCount = displayCount;
        const newDisplayCount = currentDisplayCount + 12;
        const newCards = filteredFoods.slice(currentDisplayCount, newDisplayCount);
        
        if (newCards.length > 0) {
            // Mark new cards for animation
            const newCardIds = new Set(newCards.map(card => card.foodID));
            console.log('New cards to animate:', Array.from(newCardIds));
            setNewlyAddedCards(newCardIds);
            
            setDisplayCount(newDisplayCount);
            
            // Clear animation state after animation completes
            setTimeout(() => {
                setNewlyAddedCards(new Set());
            }, 800); // Slightly longer to ensure animation completes
        }
    };

    // Get current displayed items
    const displayedFoods = filteredFoods.slice(0, displayCount);
    const hasMore = displayCount < filteredFoods.length;

    // Get background color for food category
    const getCategoryColor = (categoryName) => {
        const colorMap = {
            '溫性': 'rgb(238, 245, 238)',
            '熱性': 'rgb(255, 223, 223)',
            '涼性': 'rgb(223, 255, 252)',
            '寒性': 'rgb(223, 236, 255)',
            '平性': 'rgb(228, 239, 236)'
        };
        return colorMap[categoryName] || 'rgb(238, 245, 238)'; // Default to 溫性 color
    };

    // Food Card component with simplified animation
    const FoodCard = ({ food, isNewlyAdded, onClick }) => {
        const categoryName = foodCatData.find(cat => cat.foodCatID === food.foodCatID)?.foodCatName || '未分類';
        
        // Debug log
        if (isNewlyAdded) {
            console.log('Rendering new card with animation:', food.foodName);
        }

        return (
            <div
                className={`food-card ${isNewlyAdded ? 'new-food-card' : ''}`}
                onClick={() => onClick(food)}
            >
                {/* Food Name */}
                <div className="food-card-header">
                    <h4 className="food-card-name">
                        {food.foodName}
                    </h4>
                    {isLoggedIn && (
                        <img
                            src={saveFoodImg}
                            alt={savedFoods.has(food.foodID) ? '取消收藏' : '收藏食物'}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSaveFood(food.foodID);
                            }}
                            className={`save-food-icon ${savedFoods.has(food.foodID) ? 'saved' : ''}`}
                        />
                    
                    )}
                </div>

                {/* Category Badge */}
                <div className="food-card-category-section">
                    <span 
                        className="food-card-category-badge"
                        style={{ backgroundColor: getCategoryColor(categoryName) }}
                    >
                        {categoryName}
                    </span>
                </div>

                {/* Image and Content */}
                <div className="food-card-content">
                    <img
                        src={getFoodImagePath(food)}
                        alt={food.foodName}
                        className="food-card-image"
                    />
                    <div className="food-card-info">
                        <div className="food-info-section">
                            <strong className="food-effect-label">功效：</strong>
                            <p className="food-effect-text">
                                {food.foodEffect}
                            </p>
                        </div>

                        <div className="food-info-section">
                            <strong className="food-prohibition-label">禁忌：</strong>
                            <p className="food-prohibition-text">
                                {food.foodProhibition}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Function to open modal with selected food
    const openModal = (food) => {
        setSelectedFood(food);
        setShowModal(true);
    };

    // Function to close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedFood(null);
    };

    // FoodDetailModal component
    const FoodDetailModal = ({ food, isOpen, onClose }) => {
        if (!isOpen || !food) return null;

        const categoryName = foodCatData.find(cat => cat.foodCatID === food.foodCatID)?.foodCatName || '未分類';

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">{food.foodName}</h2>
                        <button className="modal-close-btn" onClick={onClose}>×</button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="modal-category">
                            <span 
                                className="modal-category-badge"
                                style={{ backgroundColor: getCategoryColor(categoryName) }}
                            >
                                {categoryName}
                            </span>
                        </div>

                        <div className="modal-image-container">
                            <img
                                src={getFoodImagePath(food)}
                                alt={food.foodName}
                                className="modal-food-image"
                            />
                        </div>

                        <div className="modal-details">
                            {food.foodDescription && (
                                <div className="modal-section">
                                    <h3>食物介紹</h3>
                                    <p>{food.foodDescription}</p>
                                </div>
                            )}
                            
                            <div className="modal-section">
                                <h3>功效</h3>
                                <p>{food.foodEffect}</p>
                            </div>
                            
                            <div className="modal-section">
                                <h3>禁忌</h3>
                                <p>{food.foodProhibition}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='container' >
            <div style={{
                width: '100%',
                padding: '20px 0'
            }}>
                {/* Header */}
                <div className="food-db-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{
                        color: '#284E35',
                        fontSize: '2rem',
                        marginBottom: '10px'
                    }}>
                        食物數源庫
                    </h2>
                    <p style={{
                        color: '#666',
                        fontSize: '1rem'
                    }}>
                        依據中醫五性分類的食物資料庫
                    </p>
                </div>

                {/* Search Bar and Category Filter Buttons */}
                <div className="food-db-search-container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                    marginBottom: '30px'
                }}>

                    {/* Category Buttons Container */}
                    <div className="food-db-category-buttons" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        justifyContent: 'center'
                    }}>
                        {/* All Categories Button */}
                        <button
                            onClick={() => filterByCategory('all')}
                            className={`category-button ${activeCategory === 'all' ? 'active' : ''}`}
                            style={{
                                padding: '10px 20px',
                                border: '2px solid #284E35',
                                borderRadius: '25px',
                                backgroundColor: activeCategory === 'all' ? '#284E35' : '#fff',
                                color: activeCategory === 'all' ? '#fff' : '#284E35',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                minWidth: '80px'
                            }}
                            onMouseEnter={(e) => {
                                if (activeCategory !== 'all') {
                                    e.target.style.backgroundColor = '#f8f9fa';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeCategory !== 'all') {
                                    e.target.style.backgroundColor = '#fff';
                                }
                            }}
                        >
                            全部 ({foodData.length})
                        </button>

                        {/* Category Buttons */}
                        {foodCatData.map(category => {
                            const categoryCount = foodData.filter(food => food.foodCatID === category.foodCatID).length;
                            return (
                                <button
                                    key={category.foodCatID}
                                    onClick={() => filterByCategory(category.foodCatID)}
                                    className={`category-button ${activeCategory === category.foodCatID ? 'active' : ''}`}
                                    style={{
                                        padding: '10px 20px',
                                        border: '2px solid #284E35',
                                        borderRadius: '25px',
                                        backgroundColor: activeCategory === category.foodCatID ? '#284E35' : '#fff',
                                        color: activeCategory === category.foodCatID ? '#fff' : '#284E35',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        minWidth: '80px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activeCategory !== category.foodCatID) {
                                            e.target.style.backgroundColor = '#f8f9fa';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeCategory !== category.foodCatID) {
                                            e.target.style.backgroundColor = '#fff';
                                        }
                                    }}
                                >
                                    {category.foodCatName} ({categoryCount})
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar with Autocomplete */}
                    <div className="food-db-search-bar" style={{
                        position: 'relative',
                        minWidth: '300px',
                        maxWidth: '400px'
                    }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                                onFocus={(e) => {
                                    if (searchTerm) setShowSuggestions(true);
                                    e.target.style.borderColor = '#284E35';
                                }}
                                placeholder="搜尋食物名稱、功效或描述..."
                                style={{
                                    width: '100%',
                                    padding: '12px 45px 12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '25px',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#ddd';
                                    // Delay hiding suggestions to allow clicking
                                    setTimeout(() => setShowSuggestions(false), 200);
                                }}
                            />

                            {/* Search Icon */}
                            <svg
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '18px',
                                    height: '18px',
                                    color: '#666',
                                    pointerEvents: 'none'
                                }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="M21 21l-4.35-4.35"></path>
                            </svg>

                            {/* Clear Button */}
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="clear-search-button"
                                    style={{
                                        position: 'absolute',
                                        right: '40px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#999',
                                        fontSize: '18px',
                                        padding: '0',
                                        width: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {/* Autocomplete Suggestions */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="suggestions-dropdown" style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                right: '0',
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                zIndex: 1000,
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        style={{
                                            padding: '10px 15px',
                                            cursor: 'pointer',
                                            borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Count */}
                <div className="food-db-results-count" style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    color: '#666',
                    fontSize: '0.9rem'
                }}>
                    顯示 {displayedFoods.length} / {filteredFoods.length} 項食物
                </div>

                {/* Food Items Grid */}
                <div className="food-db-grid food-grid-stagger" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {displayedFoods.map((food, index) => (
                        <FoodCard
                            key={food.foodID}
                            food={food}
                            isNewlyAdded={newlyAddedCards.has(food.foodID)}
                            onClick={openModal}
                        />
                    ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                    <div className="load-more-container">
                        <button
                            onClick={loadMore}
                            className="load-more-button"
                        >
                            載入更多
                        </button>
                    </div>
                )}

                {/* No More Results */}
                {!hasMore && filteredFoods.length > 12 && (
                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                        <p style={{ color: '#666', fontStyle: 'italic' }}>
                            已顯示所有{activeCategory === 'all' ? '' : foodCatData.find(cat => cat.foodCatID === activeCategory)?.foodCatName}食物
                        </p>
                    </div>
                )}

                {/* No Results */}
                {filteredFoods.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <p style={{ color: '#999', fontSize: '1.1rem' }}>
                            沒有找到相關食物
                        </p>
                    </div>
                )}
            </div>

            {/* Food Detail Modal */}
            <FoodDetailModal
                food={selectedFood}
                isOpen={showModal}
                onClose={closeModal}
            />
        </div>
    );
}

export default FoodDB;