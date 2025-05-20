function initializeComments(softwareId) {
    const container = document.getElementById('comments-container');
    if (!container) return;

    if (!window.currentUser) {
        container.innerHTML = `
            <p>Please sign in to comment</p>
            <div id="auth-button-container"></div>
        `;
        initializeAuth();
        return;
    }

    loadComments(softwareId);
}

function loadComments(softwareId) {
    const comments = JSON.parse(localStorage.getItem(`comments_${softwareId}`)) || [];
    const container = document.getElementById('comments-container');
    
    container.innerHTML = `
        <div class="comment-list">
            ${comments.map(c => `
                <div class="comment" data-id="${c.id}">
                    <img src="${c.authorPicture || ''}" alt="${c.author}" style="width:30px;border-radius:50%;">
                    <strong>${c.author}</strong>
                    <span class="comment-date">${new Date(c.date).toLocaleString()}</span>
                    ${window.currentUser?.isAdmin || window.currentUser?.email === c.authorEmail ? 
                      `<button onclick="deleteComment('${softwareId}', '${c.id}')">Delete</button>` : ''}
                    <p>${c.text}</p>
                </div>
            `).join('')}
        </div>
        <div class="comment-form">
            <textarea id="new-comment" placeholder="Add your comment..."></textarea>
            <button onclick="postComment('${softwareId}')">Post Comment</button>
        </div>
    `;
}

function postComment(softwareId) {
    if (!window.currentUser) return;
    
    const text = document.getElementById('new-comment').value.trim();
    if (!text) return;

    const comments = JSON.parse(localStorage.getItem(`comments_${softwareId}`)) || [];
    
    comments.push({
        id: Date.now().toString(),
        author: currentUser.name,
        authorEmail: currentUser.email,
        authorPicture: currentUser.picture,
        date: new Date().toISOString(),
        text: text
    });

    localStorage.setItem(`comments_${softwareId}`, JSON.stringify(comments));
    loadComments(softwareId);
    document.getElementById('new-comment').value = '';
}

function deleteComment(softwareId, commentId) {
    if (!window.currentUser) return;
    
    let comments = JSON.parse(localStorage.getItem(`comments_${softwareId}`)) || [];
    const comment = comments.find(c => c.id === commentId);
    
    if (currentUser.isAdmin || currentUser.email === comment.authorEmail) {
        comments = comments.filter(c => c.id !== commentId);
        localStorage.setItem(`comments_${softwareId}`, JSON.stringify(comments));
        loadComments(softwareId);
    }
}

window.postComment = postComment;
window.deleteComment = deleteComment;
