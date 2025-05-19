// Configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const ADMIN_EMAIL = 'williamjf4610@gmail.com';

// User state
let currentUser = null;

function initializeAuth() {
    // Render Google sign-in button
    const container = document.getElementById('auth-button-container');
    if (!container) return;

    container.innerHTML = `
        <div id="g_id_onload"
            data-client_id="${GOOGLE_CLIENT_ID}"
            data-callback="handleAuthResponse"
            data-auto_prompt="false">
        </div>
        <div class="g_id_signin"
            data-type="standard"
            data-size="large"
            data-theme="outline"
            data-text="sign_in_with"
            data-shape="rectangular"
            data-logo_alignment="left">
        </div>
    `;

    // Expose to global scope for Google callback
    window.handleAuthResponse = handleCredentialResponse;
}

function handleCredentialResponse(response) {
    const userData = parseJWT(response.credential);
    currentUser = {
        email: userData.email,
        name: userData.name,
        isAdmin: userData.email === ADMIN_EMAIL
    };

    updateAuthUI();
    checkAdminAccess();
}

function parseJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

    return JSON.parse(jsonPayload);
}

function updateAuthUI() {
    const authStatus = document.getElementById('auth-status');
    if (!authStatus) return;

    if (currentUser) {
        authStatus.innerHTML = `
            <span>Hi, ${currentUser.name}</span>
            <button onclick="logout()">Logout</button>
        `;
    } else {
        authStatus.innerHTML = '';
    }
}

function logout() {
    currentUser = null;
    updateAuthUI();
    // Google doesn't provide a direct logout API for this flow
    alert('You have been logged out');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeAuth);
