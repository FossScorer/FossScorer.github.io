function loadAdminData() {
    // Load submissions
    const submissions = JSON.parse(localStorage.getItem('submissions') || []);
    document.getElementById('submissions-list').innerHTML = submissions.map(s => `
        <div class="submission" data-id="${s.id}">
            <h3>${s.name}</h3>
            <p>Submitted by: ${s.email || 'Anonymous'}</p>
            <p>Price: ${s.priceScore}/5, FOSS: ${s.fossScore}/5</p>
            <p>${s.description || 'No description'}</p>
            <button onclick="approveSubmission('${s.id}')">Approve</button>
            <button onclick="rejectSubmission('${s.id}')">Reject</button>
        </div>
    `).join('');

    // Load all comments
    let allComments = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('comments_')) {
            const softwareId = key.replace('comments_', '');
            const comments = JSON.parse(localStorage.getItem(key));
            comments.forEach(c => {
                c.softwareId = softwareId;
                allComments.push(c);
            });
        }
    }
    
    document.getElementById('all-comments').innerHTML = allComments.map(c => `
        <div class="comment" data-id="${c.id}">
            <strong>${c.author}</strong>
            <span>on software ID: ${c.softwareId}</span>
            <p>${c.text}</p>
            <button onclick="deleteCommentGlobally('${c.softwareId}', '${c.id}')">Delete</button>
        </div>
    `).join('');
}

function approveSubmission(id) {
    if (!window.currentUser?.isAdmin) return;
    
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const submission = submissions.find(s => s.id === id);
    
    if (submission) {
        // Add to software list
        const software = JSON.parse(localStorage.getItem('software')) || [];
        software.push({
            id: id,
            name: submission.name,
            website: submission.website,
            priceScore: submission.priceScore,
            fossScore: submission.fossScore,
            votes: 0,
            description: submission.description
        });
        localStorage.setItem('software', JSON.stringify(software));
        
        // Remove from submissions
        localStorage.setItem('submissions', JSON.stringify(submissions.filter(s => s.id !== id)));
        
        loadAdminData();
    }
}

function deleteCommentGlobally(softwareId, commentId) {
    if (!window.currentUser?.isAdmin) return;
    
    const comments = JSON.parse(localStorage.getItem(`comments_${softwareId}`)) || [];
    localStorage.setItem(`comments_${softwareId}`, JSON.stringify(comments.filter(c => c.id !== commentId)));
    
    loadAdminData();
}

document.getElementById('export-data').addEventListener('click', () => {
    const data = {
        software: JSON.parse(localStorage.getItem('software')) || [],
        submissions: JSON.parse(localStorage.getItem('submissions')) || [],
        comments: []
    };
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('comments_')) {
            data.comments.push({
                softwareId: key.replace('comments_', ''),
                comments: JSON.parse(localStorage.getItem(key))
            });
        }
    }
    
    document.getElementById('export-result').textContent = JSON.stringify(data, null, 2);
});

// Initialize admin dashboard
if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.currentUser?.isAdmin) {
            loadAdminData();
        }
    });
}

window.approveSubmission = approveSubmission;
window.deleteCommentGlobally = deleteCommentGlobally;
