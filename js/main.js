window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    const errorDisplay = document.getElementById('error-display') || 
        document.createElement('div');
    errorDisplay.id = 'error-display';
    errorDisplay.style = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px;
        background: #ff4444;
        color: white;
        border-radius: 5px;
        z-index: 1000;
    `;
    errorDisplay.innerHTML = `
        <p>An error occurred. Please try again.</p>
        <button onclick="this.parentNode.remove()">Dismiss</button>
    `;
    document.body.appendChild(errorDisplay);
});

// Initialize with debug info
console.log('Initializing FOSS Rater', {
    repo: 'https://github.com/yourusername/yourrepo',
    lastUpdated: new Date().toISOString()
});
