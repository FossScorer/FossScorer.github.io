const DATA_URL = 'data/software.json';
let softwareData = [];

// DOM Elements
const softwareForm = document.getElementById('softwareForm');
const softwareList = document.getElementById('softwareList');
const sortName = document.getElementById('sortName');
const sortTotal = document.getElementById('sortTotal');
const sortPrice = document.getElementById('sortPrice');
const sortFoss = document.getElementById('sortFoss');

// Initialize the page
if (softwareForm) {
    softwareForm.addEventListener('submit', handleSubmit);
}

if (softwareList) {
    fetchSoftwareData();
    
    // Set up sort buttons
    sortName?.addEventListener('click', () => sortSoftware('name'));
    sortTotal?.addEventListener('click', () => sortSoftware('total'));
    sortPrice?.addEventListener('click', () => sortSoftware('price'));
    sortFoss?.addEventListener('click', () => sortSoftware('foss'));
}

// Fetch software data from JSON file
async function fetchSoftwareData() {
    try {
        const response = await fetch(DATA_URL, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        softwareData = data;
        displaySoftware(softwareData);
    } catch (error) {
        console.error('Error loading data:', error);
        softwareList.innerHTML = '<p>Error loading data. Using fallback.</p>';
    }
}

// Display software in the browse page
function displaySoftware(softwareArray) {
    if (!softwareList) return;
    
    softwareList.innerHTML = '';
    
    if (softwareArray.length === 0) {
        softwareList.innerHTML = '<p>No software found.</p>';
        return;
    }
    
    softwareArray.forEach(software => {
        const card = document.createElement('div');
        card.className = 'software-card';
        
        const totalScore = software.priceScore + software.fossScore;
        const priceStars = '💰'.repeat(software.priceScore) + '♢'.repeat(5 - software.priceScore);
        const fossStars = '★'.repeat(software.fossScore) + '☆'.repeat(5 - software.fossScore);
        
        card.innerHTML = `
            <h3>${software.name}</h3>
            <div class="score-display">
                <div class="score-category">
                    <span class="score-label">Price:</span>
                    <span class="score-value">${priceStars} (${software.priceScore}/5)</span>
                </div>
                <div class="score-category">
                    <span class="score-label">FOSS:</span>
                    <span class="score-value">${fossStars} (${software.fossScore}/5)</span>
                </div>
                <div class="total-score">
                    <span class="score-label">Total:</span>
                    <span class="score-value">${totalScore}/10</span>
                </div>
            </div>
            ${software.description ? `<p class="description">${software.description}</p>` : ''}
            ${software.website ? `<p><a href="${software.website}" target="_blank">Visit Website</a></p>` : ''}
        `;
        
        softwareList.appendChild(card);
    });
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!window.currentUser) {
        alert('Please sign in to submit software');
        return;
    }
    
    const submission = {
        name: document.getElementById('name').value,
        website: document.getElementById('website').value,
        priceScore: parseInt(document.getElementById('priceScore').value),
        fossScore: parseInt(document.getElementById('fossScore').value),
        description: document.getElementById('description').value,
        submittedBy: currentUser.email,
        timestamp: new Date().toISOString()
    };

    // Store submission in localStorage
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    submissions.push(submission);
    localStorage.setItem('submissions', JSON.stringify(submissions));

    // Show confirmation
    alert(`Thank you for submitting ${submission.name}! We'll review it soon.`);
    e.target.reset();
}

// Sort software
function sortSoftware(method) {
    if (!softwareList) return;
    
    let sortedData = [...softwareData];
    
    switch (method) {
        case 'name':
            sortedData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'total':
            sortedData.sort((a, b) => 
                (b.priceScore + b.fossScore) - (a.priceScore + a.fossScore));
            break;
        case 'price':
            sortedData.sort((a, b) => b.priceScore - a.priceScore);
            break;
        case 'foss':
            sortedData.sort((a, b) => b.fossScore - a.fossScore);
            break;
    }
    
    displaySoftware(sortedData);
}
