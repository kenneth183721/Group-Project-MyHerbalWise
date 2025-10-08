import React, { useState } from 'react';
import '../css/style.css';
import logo from '../image/logo.png';

function PanelHeader({ navigate, onLogout, user }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // User icon SVG components
    const UserIcon = ({ isOpen, onClick, style }) => (
        <svg 
            width="85" 
            height="40" 
            viewBox="0 0 85 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            onClick={onClick}
            style={style}
        >
            <rect width="85" height="40" rx="8" fill="white"/>
            <path d="M15.6111 27.4278C16.804 26.5427 18.1037 25.8436 19.51 25.3306C20.9161 24.8179 22.4127 24.5615 23.9998 24.5615C25.587 24.5615 27.0836 24.8179 28.4897 25.3306C29.896 25.8436 31.1956 26.5427 32.3886 27.4278C33.2611 26.4687 33.9525 25.3586 34.4626 24.0973C34.9728 22.836 35.2279 21.4703 35.2279 20.0001C35.2279 16.889 34.1343 14.2398 31.9472 12.0527C29.7601 9.86558 27.1109 8.77201 23.9998 8.77201C20.8887 8.77201 18.2396 9.86558 16.0525 12.0527C13.8653 14.2398 12.7718 16.889 12.7718 20.0001C12.7718 21.4703 13.0269 22.836 13.537 24.0973C14.0472 25.3586 14.7386 26.4687 15.6111 27.4278ZM24.0002 21.0527C22.7188 21.0527 21.6382 20.6129 20.7584 19.7334C19.8784 18.8536 19.4384 17.7731 19.4384 16.4917C19.4384 15.2103 19.8782 14.1297 20.7577 13.2499C21.6375 12.3699 22.7181 11.9299 23.9995 11.9299C25.2809 11.9299 26.3615 12.3697 27.2412 13.2492C28.1212 14.129 28.5612 15.2096 28.5612 16.491C28.5612 17.7724 28.1215 18.8529 27.2419 19.7327C26.3622 20.6127 25.2816 21.0527 24.0002 21.0527ZM23.9998 33.3334C22.1484 33.3334 20.4115 32.9852 18.7893 32.2889C17.1671 31.5925 15.756 30.6442 14.556 29.4439C13.3557 28.2439 12.4074 26.8328 11.7111 25.2106C11.0147 23.5884 10.6665 21.8515 10.6665 20.0001C10.6665 18.1486 11.0147 16.4118 11.7111 14.7896C12.4074 13.1673 13.3557 11.7562 14.556 10.5562C15.756 9.35599 17.1671 8.40768 18.7893 7.71131C20.4115 7.01494 22.1484 6.66675 23.9998 6.66675C25.8513 6.66675 27.5881 7.01494 29.2104 7.71131C30.8326 8.40768 32.2437 9.35599 33.4437 10.5562C34.6439 11.7562 35.5922 13.1673 36.2886 14.7896C36.985 16.4118 37.3332 18.1486 37.3332 20.0001C37.3332 21.8515 36.985 23.5884 36.2886 25.2106C35.5922 26.8328 34.6439 28.2439 33.4437 29.4439C32.2437 30.6442 30.8326 31.5925 29.2104 32.2889C27.5881 32.9852 25.8513 33.3334 23.9998 33.3334ZM23.9998 31.2282C25.2665 31.2282 26.4878 31.0244 27.6637 30.6169C28.8396 30.2092 29.8837 29.6393 30.796 28.9071C29.8837 28.2016 28.8532 27.6519 27.7044 27.258C26.5554 26.8638 25.3205 26.6667 23.9998 26.6667C22.6791 26.6667 21.4421 26.8615 20.2886 27.251C19.1352 27.6407 18.1069 28.1927 17.2037 28.9071C18.116 29.6393 19.1601 30.2092 20.336 30.6169C21.5119 31.0244 22.7332 31.2282 23.9998 31.2282ZM23.9998 18.9474C24.6981 18.9474 25.2819 18.7126 25.7514 18.2429C26.2211 17.7734 26.456 17.1896 26.456 16.4913C26.456 15.7931 26.2211 15.2092 25.7514 14.7397C25.2819 14.27 24.6981 14.0352 23.9998 14.0352C23.3016 14.0352 22.7177 14.27 22.2483 14.7397C21.7786 15.2092 21.5437 15.7931 21.5437 16.4913C21.5437 17.1896 21.7786 17.7734 22.2483 18.2429C22.7177 18.7126 23.3016 18.9474 23.9998 18.9474Z" fill="#284E35"/>
            {isOpen ? (
                <path d="M61.3787 18.5305L55.9546 23.9546L54.7121 22.7121L61.3787 16.0454L68.0454 22.7121L66.8029 23.9546L61.3787 18.5305Z" fill="#646464"/>
            ) : (
                <path d="M62.6214 21.4695L68.0455 16.0454L69.2881 17.2879L62.6214 23.9546L55.9548 17.2879L57.1973 16.0454L62.6214 21.4695Z" fill="#646464"/>
            )}
        </svg>
    );

    const handleNavClick = (route) => {
        if (navigate) {
            navigate(route);
        }
        // Close mobile menu after navigation
        setIsMobileMenuOpen(false);
    };

    const handleDropdownClick = (action) => {
        setIsDropdownOpen(false); // Close dropdown
        setIsMobileMenuOpen(false); // Close mobile menu
        
        if (action === 'logout' && onLogout) {
            onLogout();
        } else if (action === 'profile') {
            if (navigate) {
                navigate('profile');
            }
        }
    };

    return (
        <header>
        <div className='container'>
            {/* Logo */}
            <div className="logo" onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>
                <img 
                    src={logo} 
                    alt="本草智膳 MyHerbalWise" 
                    style={{
                        height: '40px',
                        width: 'auto',
                        marginRight: '12px'
                    }}
                />
                <span style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#284E35',
                    display: 'none'
                }}>
                    本草智膳
                </span>
            </div>

            {/* Mobile menu toggle */}
            <div 
                className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <nav className={isMobileMenuOpen ? 'mobile-nav-open' : ''}>
                <ul className='nav-left'>
                    <li onClick={() => handleNavClick('home')}>
                        首頁
                    </li>
                    <li onClick={() => handleNavClick('body-type-test')}>
                        體質測評
                    </li>
                    <li onClick={() => handleNavClick('health-status-tracking')}>
                        症狀追蹤
                    </li>
                    <li onClick={() => handleNavClick('dietary-tracking')}>
                        飲食紀錄
                    </li>
                    <li onClick={() => handleNavClick('food-db')}>
                        食物數源庫
                    </li>
                    <li onClick={() => handleNavClick('faq')}>
                        常見問題
                    </li>
                </ul>
                <ul className='nav-right'>
                    <li className={`dropdown ${isDropdownOpen ? 'open' : ''}`}>
                        <UserIcon 
                            isOpen={isDropdownOpen}
                            onClick={toggleDropdown}
                            style={{ cursor: 'pointer' }}
                        />
                        <ul className={isDropdownOpen ? 'show' : 'hide'}>
                            <li onClick={() => handleDropdownClick('profile')}>
                                個人頁面
                            </li>
                            <li onClick={() => handleDropdownClick('logout')}>
                                登出
                            </li>
                        </ul>
                    </li>   
                </ul>
            </nav>
            
        </div>
        </header>
    );
}

export default PanelHeader;
