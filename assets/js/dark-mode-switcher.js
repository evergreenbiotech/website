document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // --- Helper Functions ---

    // Function to set the dark mode preference in localStorage
    function setDarkModePreference(isDarkMode) {
        localStorage.setItem('darkModeEnabled', isDarkMode);
    }

    // Function to get the dark mode preference from localStorage
    function getDarkModePreference() {
        // localStorage stores strings, so convert back to boolean
        const preference = localStorage.getItem('darkModeEnabled');
        if (preference === 'true') {
            return true;
        } else if (preference === 'false') {
            return false;
        }
        return null; // No preference saved yet
    }

    // Function to apply or remove the 'dark-mode' class
    function applyDarkMode(enable) {
        if (enable) {
            body.classList.add('dark-mode');
            // Update button text/icon for light mode (next state)
            darkModeToggle.querySelector('.fa-moon').classList.remove('fa-moon');
            darkModeToggle.querySelector('.fa-moon').classList.add('fa-sun'); // Change to sun icon
            darkModeToggle.querySelector('.mode-text').textContent = 'Light Mode';
            darkModeToggle.setAttribute('title', 'Switch to Light Mode');
        } else {
            body.classList.remove('dark-mode');
            // Update button text/icon for dark mode (next state)
            darkModeToggle.querySelector('.fa-sun').classList.remove('fa-sun');
            darkModeToggle.querySelector('.fa-sun').classList.add('fa-moon'); // Change to moon icon
            darkModeToggle.querySelector('.mode-text').textContent = 'Dark Mode';
            darkModeToggle.setAttribute('title', 'Switch to Dark Mode');
        }
    }

    // --- Initialization ---

    // Get saved preference or detect system preference
    let darkModeEnabled = getDarkModePreference();

    if (darkModeEnabled === null) {
        // If no preference saved, check system preference (prefers-color-scheme)
        darkModeEnabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Apply the initial dark mode state
    applyDarkMode(darkModeEnabled);

    // --- Event Listener ---
    darkModeToggle.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior

        // Toggle the dark mode state
        const currentMode = body.classList.contains('dark-mode');
        const newMode = !currentMode;

        applyDarkMode(newMode);
        setDarkModePreference(newMode); // Save the new preference
    });
});
