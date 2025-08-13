/* Header Styles */
#header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

#logo {
    flex: 1;
    margin: 0;
}

#logo a {
    text-decoration: none;
    color: #333;
    font-size: 1.2rem;
    font-weight: bold;
}

/* Mobile Menu Toggle Button */
.mobile-menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 1001;
}

.mobile-menu-toggle span {
    display: block;
    height: 3px;
    width: 100%;
    background: #333;
    margin: 3px 0;
    transition: 0.3s;
    transform-origin: center;
}

.mobile-menu-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-toggle.active span:nth-child(2) {
    opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
}

/* Navigation Styles */
#nav {
    display: flex;
    align-items: center;
}

#nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
}

#nav li {
    position: relative;
    margin: 0;
}

#nav > ul > li > a {
    display: block;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: #333;
    white-space: nowrap;
    transition: background-color 0.3s;
}

#nav > ul > li > a:hover {
    background-color: #f5f5f5;
}

/* Dropdown Styles */
.dropdown {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background: #fff;
    border: 1px solid #ddd;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    min-width: 200px;
    z-index: 1000;
}

.dropdown li {
    width: 100%;
}

.dropdown a {
    display: block;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: #333;
    border-bottom: 1px solid #eee;
    transition: background-color 0.3s;
}

.dropdown a:hover {
    background-color: #f5f5f5;
}

/* Show dropdown on hover for desktop */
@media (min-width: 769px) {
    #nav li:hover > .dropdown,
    #nav li.hover > .dropdown {
        display: block;
    }
}

/* Mobile dropdown toggle button */
.mobile-dropdown-toggle {
    display: none;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    color: #333;
}

/* Language Toggle */
.language-toggle-wrapper {
    margin-left: 1rem;
}

.language-toggle-button {
    background: #007bff;
    color: white !important;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.9rem;
    transition: background-color 0.3s;
}

.language-toggle-button:hover {
    background: #0056b3 !important;
}

/* Mobile Styles */
@media (max-width: 768px) {
    .mobile-menu-toggle {
        display: flex;
    }
    
    #nav {
        position: fixed;
        top: 0;
        right: -100%;
        width: 280px;
        height: 100vh;
        background: #fff;
        transition: right 0.3s ease;
        z-index: 1000;
        overflow-y: auto;
        box-shadow: -2px 0 10px rgba(0,0,0,0.1);
        padding-top: 60px;
    }
    
    #nav.mobile-open {
        right: 0;
    }
    
    #nav ul {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
    }
    
    #nav li {
        width: 100%;
        border-bottom: 1px solid #eee;
        position: relative;
    }
    
    #nav a {
        padding: 1rem 1.5rem;
        border-bottom: none;
    }
    
    .dropdown {
        position: static;
        display: none;
        box-shadow: none;
        border: none;
        border-top: 1px solid #eee;
        background: #f8f9fa;
    }
    
    .mobile-dropdown-open > .dropdown {
        display: block;
    }
    
    .mobile-dropdown-toggle {
        display: block;
    }
    
    /* Mobile overlay */
    #nav.mobile-open::before {
        content: '';
        position: fixed;
        top: 0;
        left: -280px;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.5);
        z-index: -1;
    }
    
    /* Language toggle in mobile */
    .language-toggle-wrapper {
        margin: 0;
        padding: 1rem 1.5rem;
        background: #f8f9fa;
    }
    
    .language-toggle-button {
        width: 100%;
        text-align: center;
        display: block;
    }
}

/* Hide mobile elements on desktop */
@media (min-width: 769px) {
    .mobile-menu-toggle,
    .mobile-dropdown-toggle {
        display: none !important;
    }
}

/* Error message styling */
.error {
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    margin: 1rem;
}
