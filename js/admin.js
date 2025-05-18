// Configure these values
const ALLOWED_ADMIN_EMAIL = 'williamjf4610@gmail.com';
const SUBMISSIONS_STORAGE_KEY = 'fossSubmissions';

function handleCredentialResponse(response) {
    const responsePayload = parseJwt(response.credential);
    
    if (responsePayload.email === ALLOWED_ADMIN_EMAIL) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        loadSubmissions();
    } else {
        alert('Access denied. Only authorized admins can access this page.');
    }
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function loadSubmissions() {
    try {
        const submissions = JSON.parse(localStorage.getItem(SUBMISSIONS_STORAGE_KEY)) || [];
        
        const submissionsList = document.getElementById('submissions-list');
        if (submissions.length === 0) {
            submissionsList.innerHTML = '<p>No submissions found.</p>';
            return;
        }
        
        submissionsList.innerHTML = submissions.map(sub => `
            <div class="submission-card">
                <h3>${sub.name}</h3>
                <p><strong>Submitted:</strong> ${new Date(sub.timestamp).toLocaleString()}</p>
                <p><strong>Email:</strong> ${sub.email || 'Not provided'}</p>
                <p><strong>Website:</strong> ${sub.website || 'Not provided'}</p>
                <p><strong>Price Score:</strong> ${sub.priceScore}/5</p>
                <p><strong>FOSS Score:</strong> ${sub.fossScore}/5</p>
                <p><strong>Description:</strong> ${sub.description || 'None'}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading submissions:', error);
        document.getElementById('submissions-list').innerHTML = '<p>Error loading submissions</p>';
    }
}

document.getElementById('export-data').addEventListener('click', () => {
    const submissions = JSON.parse(localStorage.getItem(SUBMISSIONS_STORAGE_KEY)) || [];
    const exportData = JSON.stringify(submissions, null, 2);
    document.getElementById('export-result').textContent = exportData;
});

document.getElementById('logout').addEventListener('click', () => {
    // This is a basic logout - in a real app you'd properly revoke the token
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('export-result').textContent = '';
});
