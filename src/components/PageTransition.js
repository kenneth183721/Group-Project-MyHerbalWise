import React, { useState, useEffect } from 'react';

const PageTransition = ({ 
    children, 
    currentRoute, 
    transitionKey = currentRoute,
    animationType = 'fade' // 'fade', 'slide', 'scale'
}) => {
    const [displayedChild, setDisplayedChild] = useState(children);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (displayedChild !== children) {
            setIsTransitioning(true);
            
            // Wait for exit animation to complete, then switch content
            const timer = setTimeout(() => {
                setDisplayedChild(children);
                setIsTransitioning(false);
            }, 300); // Half of total transition time

            return () => clearTimeout(timer);
        }
    }, [children, displayedChild]);

    const getAnimationStyles = () => {
        switch (animationType) {
            case 'slide':
                return {
                    transform: isTransitioning ? 'translateX(-100%)' : 'translateX(0)',
                    opacity: isTransitioning ? 0 : 1,
                    transition: 'all 0.3s ease-in-out'
                };
            case 'scale':
                return {
                    transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
                    opacity: isTransitioning ? 0 : 1,
                    transition: 'all 0.3s ease-in-out'
                };
            case 'fade':
            default:
                return {
                    opacity: isTransitioning ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                };
        }
    };

    return (
        <div 
            style={{
                minHeight: '60vh',
                ...getAnimationStyles()
            }}
            key={transitionKey}
        >
            {displayedChild}
        </div>
    );
};

export default PageTransition;