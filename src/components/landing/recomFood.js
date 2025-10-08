import React, { useState, useEffect, useCallback } from 'react';
import foodDB from '../../json/foodDB.json';
import foodCatData from '../../json/foodCat.json';
import bodyTypeData from '../../json/bodyType.json';
import placeHolderImg from '../../image/PlaceholderImage.png';
import '../../css/landing/recomFood.css';

function RecommendedFood({ isLoggedIn, currentUser, bodyType }) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updateTimer, setUpdateTimer] = useState(null);
    const [displayCount, setDisplayCount] = useState(3); // Start with 3 items
    const [allRecommendations, setAllRecommendations] = useState([]); // Store all available items

    // Debug logging
    console.log('RecommendedFood component props:', { isLoggedIn, currentUser, bodyType });
    console.log('isLoggedIn type:', typeof isLoggedIn, 'value:', isLoggedIn);

    // Ensure isLoggedIn is properly converted to boolean
    const userLoggedIn = Boolean(isLoggedIn);

    // Helper function to get food image path
    const getFoodImagePath = (food) => {
        if (food.foodCatImg) {
            try {
                return require(`../../image/food/${food.foodCatImg}`);
            } catch (error) {
                console.warn(`Image not found: ${food.foodCatImg}`, error);
                return placeHolderImg;
            }
        }
        return placeHolderImg;
    };

    // Generate recommendations based on body type
    const generateRecommendations = useCallback(() => {
        // bodyType can be either a string (like "bt02") or an object with bodyTypeID
        const bodyTypeID = typeof bodyType === 'string' ? bodyType : bodyType?.bodyTypeID;
        
        if (!bodyTypeID) {
            console.log('No body type provided', bodyType);
            return;
        }

        console.log('Generating recommendations for body type:', bodyTypeID);
        setLoading(true);

        try {
            // Get current date
            const today = new Date();
            const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            // Create seeded random based on date and user
            const seed = dateKey + (currentUser?.userID || '');
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                const char = seed.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            
            // Use seeded random to ensure same recommendations for the same day
            const seededRandom = (seed) => {
                const x = Math.sin(seed) * 10000;
                return x - Math.floor(x);
            };

            // Find the user's body type data
            const userBodyType = bodyTypeData.find(bt => bt.bodyTypeID === bodyTypeID);
            let recommendedFoods = [];
            
            if (userBodyType) {
                console.log('Found body type data:', userBodyType.bodyTypeName);
                console.log('Eligible foods:', userBodyType.EligibleFoodID);
                console.log('Ineligible foods:', userBodyType.IneligibleFoodID);

                // Filter foods based on body type eligibility
                foodDB.forEach(food => {
                    const isEligible = userBodyType.EligibleFoodID.includes(food.foodID);
                    const isIneligible = userBodyType.IneligibleFoodID.includes(food.foodID);
                    
                    // Include food if it's explicitly eligible OR if it's not in ineligible list
                    // Priority: Eligible list > Not in ineligible list
                    if (isEligible || (!isIneligible && userBodyType.EligibleFoodID.length === 0)) {
                        recommendedFoods.push({
                            ...food,
                            category: foodCatData.find(cat => cat.foodCatID === food.foodCatID),
                            isHighlyRecommended: isEligible, // Mark explicitly recommended foods
                            personalizedReason: isEligible ? '特別適合您的體質' : '適合食用'
                        });
                    }
                });
                
                console.log('Personalized recommended foods:', recommendedFoods.length);
            } else {
                console.log('Body type not found, showing all foods as fallback');
                // Fallback: show all foods if body type not found
                foodDB.forEach(food => {
                    recommendedFoods.push({
                        ...food,
                        category: foodCatData.find(cat => cat.foodCatID === food.foodCatID)
                    });
                });
            }
            
            console.log('Total recommended foods:', recommendedFoods.length);

            // If we have recommended foods, shuffle and store more for load-more functionality
            if (recommendedFoods.length > 0) {
                // Shuffle array with seeded random
                let currentIndex = recommendedFoods.length;
                let randomIndex;
                let seedCounter = Math.abs(hash);

                while (currentIndex !== 0) {
                    randomIndex = Math.floor(seededRandom(seedCounter++) * currentIndex);
                    currentIndex--;
                    [recommendedFoods[currentIndex], recommendedFoods[randomIndex]] = 
                    [recommendedFoods[randomIndex], recommendedFoods[currentIndex]];
                }

                // Store all recommendations and display first 3
                const processedFoods = recommendedFoods.map(food => ({
                    ...food,
                    imageUrl: getFoodImagePath(food)
                }));

                setAllRecommendations(processedFoods);
                setRecommendations(processedFoods.slice(0, displayCount));
                
                console.log(`Set ${processedFoods.length} total recommendations, displaying ${Math.min(displayCount, processedFoods.length)}`);

            } else {
                console.log('No eligible foods found for body type:', bodyTypeID);
                setRecommendations([]);
                setAllRecommendations([]);
            }
        } catch (error) {
            console.error('Error generating recommendations:', error);
        } finally {
            setLoading(false);
        }
    }, [bodyType, currentUser, displayCount]);

    // Generate random recommendations for non-logged-in users
    const generateRandomRecommendations = useCallback(() => {
        setLoading(true);
        
        try {
            // Get current time and create a seed that changes every 15 minutes
            const now = new Date();
            const fifteenMinuteInterval = Math.floor(now.getTime() / (15 * 60 * 1000)); // 15 minutes in milliseconds
            const seed = fifteenMinuteInterval.toString();
            
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                const char = seed.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            
            // Use seeded random to ensure same recommendations for 15-minute intervals
            const seededRandom = (seedValue) => {
                const x = Math.sin(seedValue) * 10000;
                return x - Math.floor(x);
            };

            // Show random foods for guests
            let randomFoods = [...foodDB];
            let currentIndex = randomFoods.length;
            let randomIndex;
            let seedCounter = Math.abs(hash);

            while (currentIndex !== 0) {
                randomIndex = Math.floor(seededRandom(seedCounter++) * currentIndex);
                currentIndex--;
                [randomFoods[currentIndex], randomFoods[randomIndex]] = 
                [randomFoods[randomIndex], randomFoods[currentIndex]];
            }

            // Store all random foods and display based on current displayCount
            const processedFoods = randomFoods.map(food => ({
                ...food,
                category: foodCatData.find(cat => cat.foodCatID === food.foodCatID),
                imageUrl: getFoodImagePath(food)
            }));
            setAllRecommendations(processedFoods);
            setRecommendations(processedFoods.slice(0, displayCount));

        } catch (error) {
            console.error('Error generating random recommendations:', error);
        } finally {
            setLoading(false);
        }
    }, [displayCount]);

    // Start timer for automatic random updates (non-logged-in users only)
    const startRandomUpdateTimer = useCallback(() => {
        if (updateTimer) {
            clearInterval(updateTimer);
        }
        
        // Set up 15-minute interval (15 * 60 * 1000 = 900,000 milliseconds)
        // For testing: using 30 seconds (30 * 1000), change back to 15 * 60 * 1000 for production
        const timer = setInterval(() => {
            if (!userLoggedIn) {
                console.log('🔄 Auto-updating random food recommendations...');
                generateRandomRecommendations();
            }
        }, 15 * 60 * 1000); // 15 minutes for production
        
        setUpdateTimer(timer);
        console.log('⏰ Random update timer started for non-logged-in users (15 min intervals)');
    }, [updateTimer, userLoggedIn, generateRandomRecommendations]);

    // Stop timer for automatic updates
    const stopRandomUpdateTimer = useCallback(() => {
        if (updateTimer) {
            clearInterval(updateTimer);
            setUpdateTimer(null);
            console.log('⏹️ Random update timer stopped');
        }
    }, [updateTimer]);

    // Handle loading more items
    const handleLoadMore = () => {
        const newDisplayCount = displayCount + 3;
        setDisplayCount(newDisplayCount);
        setRecommendations(allRecommendations.slice(0, newDisplayCount));
    };

    // Reset display count when recommendations change
    const resetDisplayCount = () => {
        setDisplayCount(3);
    };

    // Initial load for non-logged-in users
    useEffect(() => {
        if (!userLoggedIn && recommendations.length === 0) {
            generateRandomRecommendations();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLoggedIn]); // Add userLoggedIn as dependency

    // Generate recommendations when body type changes OR when component mounts for non-logged-in users
    useEffect(() => {
        console.log('useEffect triggered - bodyType:', bodyType, 'userLoggedIn:', userLoggedIn);
        
        if (bodyType) {
            generateRecommendations();
        } else if (!userLoggedIn) {
            // For non-logged-in users, show random food recommendations
            generateRandomRecommendations();
        } else {
            // Logged in but no body type - clear recommendations
            console.log('Logged in but no body type found');
            setRecommendations([]);
            setAllRecommendations([]);
        }
    }, [bodyType, userLoggedIn, generateRecommendations, generateRandomRecommendations]);

    // Manage auto-update timer for non-logged-in users
    useEffect(() => {
        if (!userLoggedIn) {
            // Start timer for non-logged-in users
            startRandomUpdateTimer();
        } else {
            // Stop timer for logged-in users
            stopRandomUpdateTimer();
        }

        // Cleanup timer when component unmounts
        return () => {
            stopRandomUpdateTimer();
        };
    }, [userLoggedIn, startRandomUpdateTimer, stopRandomUpdateTimer]);

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (updateTimer) {
                clearInterval(updateTimer);
            }
        };
    }, [updateTimer]);

    // Reset display count when bodyType or login status changes
    useEffect(() => {
        resetDisplayCount();
    }, [bodyType, userLoggedIn]);

    if (loading) {
        return (
            <div className="recommended-food-loading">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div>正在為您生成個人化食物推薦...</div>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="recommended-food-empty">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div>
                        {userLoggedIn ? 
                            '暫無推薦食物，請先完成體質測試' : 
                            '載入美食推薦中...'
                        }
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="recommended-food">
            <div className="recommended-food-header">
                <div>
                    <h2 className="recommended-food-title">
                        {userLoggedIn ? '為您推薦的養生食材' : '今日推薦美食'}
                    </h2>
                    <p className="recommended-food-subtitle">
                        {userLoggedIn ? '根據您的體質為您精選' : '每15分鐘更新推薦'}
                    </p>
                </div>
            </div>
            
            <div className="food-cards-grid">
                {recommendations.map((food, index) => (
                    <div 
                        key={food.foodID} 
                        className="food-card"
                    >
                        <div className="food-card-image-container">
                            <img 
                                src={getFoodImagePath(food)} 
                                alt={food.foodName}
                                className="food-card-image"
                                onError={(e) => {
                                    e.target.src = placeHolderImg;
                                }}
                            />
                        </div>
                        
                        <div className="food-card-content">
                            <h3 className="food-card-name">
                                {food.foodName}
                                {food.isHighlyRecommended && (
                                    <span className="recommended-badge">推薦</span>
                                )}
                            </h3>
                            
                            <p className="food-card-effect">
                                {food.foodEffect}
                            </p>
                            
                            {userLoggedIn && food.personalizedReason && (
                                <p className="personalized-reason">
                                    {food.personalizedReason}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Load More Button */}
            {recommendations.length > 0 && allRecommendations.length > displayCount && (
                <div className="load-more-section">
                    <button 
                        onClick={handleLoadMore}
                        className="load-more-button"
                    >
                        載入更多
                    </button>
                </div>
            )}
        </div>
    );
}

export default RecommendedFood;