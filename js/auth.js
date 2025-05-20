const GOOGLE_CLIENT_ID = '882779103735-1in74lemj1ck5ur3k5h433fqdale0qf7.apps.googleusercontent.com';
const ADMIN_EMAIL = 'williamjf4610@gmail.com';
let currentUser = null;

// Initialize auth with session persistence
function initializeAuth() {
    // Check for existing session
    const savedSession = localStorage.getItem('fossRaterSession');
    if (savedSession) {
        try {
            currentUser = JSON.parse(savedSession);
            updateAuthUI();
            checkAdminAccess();
        } catch (e) {
            localStorage.removeItem('fossRaterSession');
        }
    }

    // Load Google auth library if needed
    if (typeof google === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogleAuth;
        document.head.appendChild(script);
    } else {
        initGoogleAuth();
    }
}

function initGoogleAuth() {
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false
    });
    
    // Render button if container exists
    const container = document.getElementById('auth-button-container');
    if (container) {
        google.accounts.id.renderButton(container, {
            type: 'standard',
            size: 'large',
            theme: 'outline',
            text: 'signin_with'
        });
    }
}

function handleCredentialResponse(response) {
    const userData = parseJWT(response.credential);
    currentUser = {
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        isAdmin: userData.email === ADMIN_EMAIL,
        token: response.credential
    };

    // Save session to localStorage
    localStorage.setItem('fossRaterSession', JSON.stringify(currentUser));
    
    updateAuthUI();
    dispatchAuthEvent();
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

function logout() {
    currentUser = null;
    localStorage.removeItem('fossRaterSession');
    
    if (typeof google !== 'undefined') {
        google.accounts.id.disableAutoSelect();
    }
    
    updateAuthUI();
    dispatchAuthEvent();
    window.location.reload();
}

function dispatchAuthEvent() {
    const event = new Event('authChange');
    document.dispatchEvent(event);
}

function validateSession() {
    const savedSession = localStorage.getItem('fossRaterSession');
    if (!savedSession) return false;
    
    try {
        const session = JSON.parse(savedSession);
        if (!session.token) return false;
        
        const payload = JSON.parse(atob(session.token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('fossRaterSession');
            return false;
        }
        return true;
    } catch (e) {
        localStorage.removeItem('fossRaterSession');
        return false;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    if (validateSession()) {
        initializeAuth();
    } else {
        initializeAuth();
    }
});

// Sync logout across tabs
window.addEventListener('storage', (event) => {
    if (event.key === 'fossRaterSession' && !event.newValue) {
        logout();
    }
});

// Make logout available globally
window.logout = logout;
