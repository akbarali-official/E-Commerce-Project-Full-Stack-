import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-container">
      {/* Top Grid Section */}
      <div className="footer-top">
        {/* Box 1: SHOP.CO */}
        <div className="footer-col brand-col">
          <h2 className="brand-logo">SHOP.CO</h2>
          <p className="brand-desc">
            We have clothes that suits your style and which you're proud to wear. From women to men.
          </p>
          <div className="social-icons">
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-github"></i></a>
          </div>
        </div>

        {/* Box 2: COMPANY */}
        <div className="footer-col">
          <h4>COMPANY</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Features</a></li>
            <li><a href="#">Works</a></li>
            <li><a href="#">Career</a></li>
          </ul>
        </div>

        {/* Box 3: HELP */}
        <div className="footer-col">
          <h4>HELP</h4>
          <ul>
            <li><a href="#">Customer Support</a></li>
            <li><a href="#">Delivery Details</a></li>
            <li><a href="#">Terms & Conditions</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Box 4: FAQ */}
        <div className="footer-col">
          <h4>FAQ</h4>
          <ul>
            <li><a href="#">Account</a></li>
            <li><a href="#">Manage Deliveries</a></li>
            <li><a href="#">Orders</a></li>
            <li><a href="#">Payments</a></li>
          </ul>
        </div>

        {/* Box 5: RESOURCES */}
        <div className="footer-col">
          <h4>RESOURCES</h4>
          <ul>
            <li><a href="#">Free eBooks</a></li>
            <li><a href="#">Development Tutorial</a></li>
            <li><a href="#">How to - Blog</a></li>
            <li><a href="#">Youtube Playlist</a></li>
          </ul>
        </div>
      </div>

      <hr className="footer-divider" />

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p className="copyright">Shop.co © 2000-2023, All Rights Reserved</p>
        <div className="payment-methods">
      <span className="payment-badge">Visa</span>
       <span className="payment-badge">MasterCard</span>
        <span className="payment-badge">PayPal</span>
        <span className="payment-badge">Apple Pay</span>
        <span className="payment-badge">Google Pay</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;