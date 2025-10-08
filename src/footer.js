function Footer({ navigate }) {
  const handlePolicyClick = () => {
    if (navigate) {
      navigate('policy');
    }
  };

  return (
    <footer>
      <p>
        © 2025 本草智膳 MyHerbalWise. All rights reserved. | {' '}
        <span 
          onClick={handlePolicyClick}
          style={{ 
            color: '#fff', 
            cursor: 'pointer', 
            textDecoration: 'underline',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => e.target.style.color = '#1a3426'}
          onMouseLeave={(e) => e.target.style.color = '#fff'}
        >
          私隱政策
        </span>
      </p>
    </footer>
  );
}

export default Footer;
