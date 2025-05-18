// Store data in a JSON file hosted on GitHub
const DATA_URL = 'https://raw.githubusercontent.com/FossScorer/FossScorer.github.io/main/data/software.json';

// DOM Elements
const softwareForm = document.getElementById('softwareForm');
const softwareList = document.getElementById('softwareList');
const sortName = document.getElementById('sortName');
const sortHigh = document.getElementById('sortHigh');
const sortLow = document.getElementById('sortLow');

// Current software data
let softwareData = [];

// Initialize the page
if (softwareForm) {
    softwareForm.addEventListener('submit', handleSubmit);
}

if (softwareList) {
    fetchSoftwareData();
    
    // Set up sort buttons
    sortName.addEventListener('click', () => sortSoftware('name'));
    sortHigh.addEventListener('click', () => sortSoftware('high'));
    sortLow.addEventListener('click', () => sortSoftware('low'));
}

// Fetch software data from JSON file
async function fetchSoftwareData() {
    try {
        const response = await fetch(DATA_URL);
        softwareData = await response.json();
        displaySoftware(softwareData);
    } catch (error) {
        console.error('Error fetching software data:', error);
        softwareList.innerHTML = '<p>Error loading software data. Please try again later.</p>';
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
        
        const stars = '★'.repeat(software.rating) + '☆'.repeat(5 - software.rating);
        
        card.innerHTML = `
            <h3>${software.name}</h3>
            <p class="rating">${stars} (${software.rating}/5)</p>
            ${software.website ? `<p><a href="${software.website}" target="_blank">Visit Website</a></p>` : ''}
            <p>${software.votes} votes</p>
        `;
        
        softwareList.appendChild(card);
    });
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const website = document.getElementById('website').value;
    const email = document.getElementById('email').value;
    
    // In a real implementation, this would submit to a backend
    // For GitHub Pages, we'll simulate it with an alert
    alert(`Thank you for submitting ${name}! We'll review it soon.`);
    
    // Reset form
    e.target.reset();
    
    // In a real implementation, you might:
    // 1. Store in localStorage temporarily
    // 2. Create a GitHub Issue via API
    // 3. Redirect to a thank you page
}

// Sort software
function sortSoftware(method) {
    // Update active button
    [sortName, sortHigh, sortLow].forEach(btn => btn.classList.remove('active'));
    document.getElementById(`sort${method.charAt(0).toUpperCase() + method.slice(1)}`).classList.add('active');
    
    let sortedData = [...softwareData];
    
    switch (method) {
        case 'name':
            sortedData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'high':
            sortedData.sort((a, b) => b.rating - a.rating || b.votes - a.votes);
            break;
        case 'low':
            sortedData.sort((a, b) => a.rating - b.rating || b.votes - a.votes);
            break;
    }
    
    displaySoftware(sortedData);
}
