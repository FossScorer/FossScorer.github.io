const GOOGLE_CLIENT_ID = '882779103735-1in74lemj1ck5ur3k5h433fqdale0qf7.apps.googleusercontent.com';
const ADMIN_EMAIL = 'williamjf4610@gmail.com';

let currentUser = null;

function initializeAuth() {
    if (typeof google === 'undefined') {
        console.error('Google identity services not loaded');
        setTimeout(initializeAuth, 500);
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
    });

    const button = document.getElementById('auth-button-container');
    if (button) {
        google.accounts.id.renderButton(
            button,
            { 
                type: 'standard',
                size: 'large',
                theme: 'outline',
                text: 'signin_with',
                shape: 'rectangular'
            }
        );
    }
}
function handleCredentialResponse(response) {
    const userData = parseJWT(response.credential);
    dispatchAuthEvent(); // Add this line

    currentUser = {
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        isAdmin: userData.email === ADMIN_EMAIL
    };

    updateAuthUI();
    checkAdminAccess();
    
    // Refresh any forms that need auth
    if (document.getElementById('softwareForm')) {
        document.getElementById('auth-required').style.display = 'none';
        document.getElementById('softwareForm').style.display = 'block';
    }
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
            <img src="${currentUser.picture}" alt="${currentUser.name}" style="width:30px;border-radius:50%;">
            <span>${currentUser.name}</span>
            <button onclick="logout()">Logout</button>
        `;
    } else {
        authStatus.innerHTML = '';
    }
}

// Add this to your existing auth.js
function dispatchAuthEvent() {
    const event = new Event('authChange');
    document.dispatchEvent(event);
}



// Update logout function to include:
function logout() {
    currentUser = null;
    updateAuthUI();
    dispatchAuthEvent(); // Add this line
    window.location.reload();
}


function checkAdminAccess() {
    if (window.location.pathname.includes('admin.html') && currentUser?.isAdmin) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
    }
}


// Initialize on load
document.addEventListener('DOMContentLoaded', initializeAuth);
window.logout = logout;


