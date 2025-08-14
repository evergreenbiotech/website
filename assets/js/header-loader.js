/* Floating header */
.fixed-header {
    position: sticky;
    top: 0;
    z-index: 999;
}

/* Language toggle button */
.lang-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.4rem 0.8rem;
    border: 2px solid #007bff;
    border-radius: 4px;
    background: white;
    font-weight: bold;
    color: #007bff;
    transition: all 0.3s ease;
}

.lang-btn:hover {
    background: #007bff;
    color: white;
}

.flag {
    font-size: 1.1rem;
}

/* Bold main menu items */
#nav > ul > li > a strong {
    font-weight: bold;
}
