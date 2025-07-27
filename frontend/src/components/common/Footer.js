// src/components/Footer.js 또는 src/common/Footer.js
import React from 'react';
import '../stadium/Stadium.css';

function Footer() {
    return (
        <footer className="stadium-footer">
            <div className="stadium-container">
                <div className="stadium-footer-content">
                    <p>&copy; 2025 YABAB Info. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;