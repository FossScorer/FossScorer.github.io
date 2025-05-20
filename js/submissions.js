// Store data in a JSON file hosted on GitHub
const DATA_URL = 'data/software.json';

// DOM Elements
const softwareForm = document.getElementById('softwareForm');
const softwareList = document.getElementById('softwareList');
const sortName = document.getElementById('sortName');
const sortTotal = document.getElementById('sortTotal');
const sortPrice = document.getElementById('sortPrice');
const sortFoss = document.getElementById('sortFoss');

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
    sortTotal.addEventListener('click', () => sortSoftware('total'));
    sortPrice.addEventListener('click', () => sortSoftware('price'));
    sortFoss.addEventListener('click', () => sortSoftware('foss'));
}

// Fetch software data from JSON file
async function fetchSoftwareData() {
    try {
        const response = await fetch('data/software.json', {
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        softwareData = await response.json();
        displaySoftware(softwareData);
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        softwareData = JSON.parse(localStorage.getItem('softwareData')) || [];
        if (softwareData.length > 0) {
            displaySoftware(softwareData);
        } else {
            softwareList.innerHTML = `
                <p>Using default data. Please check your connection.</p>
                <button onclick="location.reload()">Retry</button>
            `;
            loadDefaultData();
        }
    }
}

function loadDefaultData() {
    const defaultData = [
        {
            "id": "1",
            "name": "LibreOffice",
            "website": "https://www.libreoffice.org/",
            "priceScore": 5,
            "fossScore": 5,
            "votes": 42,
            "description": "Free and open source office suite"
        }
    ];
    localStorage.setItem('softwareData', JSON.stringify(defaultData));
    softwareData = defaultData;
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
    
    const submission = {
        name: document.getElementById('name').value,
        website: document.getElementById('website').value,
        email: document.getElementById('email').value,
        priceScore: parseInt(document.getElementById('priceScore').value),
        fossScore: parseInt(document.getElementById('fossScore').value),
        description: document.getElementById('description').value,
        timestamp: new Date().toISOString()
    };

    // Store in localStorage as fallback
    const localSubmissions = JSON.parse(localStorage.getItem('fossSubmissions') || '[]');
    localSubmissions.push(submission);
    localStorage.setItem('fossSubmissions', JSON.stringify(localSubmissions));

    // Send email notification (using FormSubmit.co as a simple solution)
    try {
        await fetch('https://formsubmit.co/ajax/williamjf4610@gmail.com', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: submission.name,
                website: submission.website,
                email: submission.email || 'Not provided',
                message: `New FOSS Rating Submission:
                
Name: ${submission.name}
Website: ${submission.website || 'Not provided'}
Email: ${submission.email || 'Not provided'}
Price Score: ${submission.priceScore}/5
FOSS Score: ${submission.fossScore}/5
Description: ${submission.description || 'None'}

Timestamp: ${new Date(submission.timestamp).toLocaleString()}
                `,
                _subject: `New FOSS Submission: ${submission.name}`,
                _replyto: submission.email || 'williamjf4610@gmail.com'
            })
        });
    } catch (emailError) {
        console.error('Error sending email:', emailError);
    }

    // Show confirmation
    alert(`Thank you for submitting ${submission.name}!\n\nPrice Rating: ${submission.priceScore}/5\nFOSS Rating: ${submission.fossScore}/5\n\nWe'll review your submission soon.`);
    e.target.reset();
}

// Sort software
function sortSoftware(method) {
    // Update active button
    document.querySelectorAll('.sort-options button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`sort${method.charAt(0).toUpperCase() + method.slice(1)}`).classList.add('active');
    
    let sortedData = [...softwareData];
    
    switch (method) {
        case 'name':
            sortedData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'total':
            sortedData.sort((a, b) => 
                (b.priceScore + b.fossScore) - (a.priceScore + a.fossScore) || 
                b.votes - a.votes
            );
            break;
        case 'price':
            sortedData.sort((a, b) => b.priceScore - a.priceScore || b.votes - a.votes);
            break;
        case 'foss':
            sortedData.sort((a, b) => b.fossScore - a.fossScore || b.votes - a.votes);
            break;
    }
    
    displaySoftware(sortedData);
}
