document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const introContainer = document.getElementById('intro-container');
    const content = document.querySelector('.content');
    
    // Check if the cookie exists
    const introShown = getCookie('introShown');

    // If the cookie exists, skip the intro and show the content
    if (introShown) {
        introContainer.style.display = 'none';
        content.classList.add('visible'); // Make sure to fade in the content
    } else {
        // Show the intro and set the cookie after 4 seconds
        setTimeout(() => {
            introContainer.style.display = 'none';
            content.classList.add('visible'); // Fade-in effect for content
            setCookie('introShown', 'true', 1); // Set cookie for 1 hour
        }, 4000); // Show intro for 4 seconds before hiding it
    }
});

// Function to set a cookie
function setCookie(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000)); // Set expiration time
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to get a cookie by name
function getCookie(name) {
    const decodedCookies = decodeURIComponent(document.cookie);
    const cookies = decodedCookies.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.indexOf(name + "=") == 0) {
            return c.substring(name.length + 1, c.length);
        }
    }
    return ""; // Return an empty string if the cookie is not found
}
