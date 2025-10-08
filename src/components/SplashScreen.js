import React, { useState, useEffect } from 'react';
import logo from '../image/logo.png';

const SplashScreen = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [animationPhase, setAnimationPhase] = useState('fade-in'); // 'fade-in', 'pulse', 'fade-out'

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setAnimationPhase('pulse');
        }, 800);

        const timer2 = setTimeout(() => {
            setAnimationPhase('fade-out');
        }, 2500);

        const timer3 = setTimeout(() => {
            setIsVisible(false);
            onFinish();
        }, 3200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onFinish]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            opacity: animationPhase === 'fade-out' ? 0 : 1,
            transition: 'opacity 0.8s ease-out'
        }}>
            {/* Logo/Brand */}
            <div style={{
                textAlign: 'center',
                transform: animationPhase === 'fade-in' ? 'translateY(30px)' : 'translateY(0)',
                opacity: animationPhase === 'fade-in' ? 0 : 1,
                transition: 'all 0.8s ease-out',
                animation: animationPhase === 'pulse' ? 'splashPulse 1.5s ease-in-out infinite' : 'none'
            }}>
                <img 
                    src={logo} 
                    alt="本草智膳 MyHerbalWise" 
                    style={{ 
                        width: '200px', 
                    }} 
                />
            </div>

            {/* Loading Animation */}
            <div style={{
                display: 'flex',
                gap: '8px',
                opacity: animationPhase === 'fade-in' ? 0 : 1,
                transform: animationPhase === 'fade-in' ? 'translateY(20px)' : 'translateY(0)',
                transition: 'all 0.8s ease-out 0.3s'
            }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#284E35',
                    animation: 'splashDot1 1.5s ease-in-out infinite'
                }} />
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#284E35',
                    animation: 'splashDot2 1.5s ease-in-out infinite'
                }} />
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#284E35',
                    animation: 'splashDot3 1.5s ease-in-out infinite'
                }} />
            </div>

        </div>
    );
};

export default SplashScreen;