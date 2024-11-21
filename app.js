const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
let token = null;
let resultOffset = 0;
let currentAudio = null; // Keep track of the currently playing audio
let isPlaying = false; // State to track whether the song is playing or paused

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const imageback=document.getElementById('backgroundimage');
const loadingSpinner = document.getElementById('loading-spinner');
const container=document.getElementById('container');
const tracksContainer = document.getElementById('tracks-container');
const messageElement = document.getElementById('message');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');

// Retrieve token
async function fetchToken() {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials&client_id=c9659564da61468f8adacb55b2425c66&client_secret=a92e4f077bdf4e57be8e7568b42abb83'
        });
        
        if (!response.ok) throw new Error('Failed to fetch token');
        
        const jsonData = await response.json();
        token = jsonData.access_token;
    } catch (error) {
        console.error(error);
        messageElement.textContent = error.message;
    }
}

// Fetch music data
async function fetchMusicData(query) {
    if (!token) await fetchToken();
    
    loadingSpinner.classList.remove('hidden');
    messageElement.textContent = '';
    tracksContainer.innerHTML = '';
    
    try {
        const response = await fetch(`${SPOTIFY_API_BASE_URL}/search?q=${query}&type=track&offset=${resultOffset}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch music data');
        
        const jsonData = await response.json();
        displayTracks(jsonData.tracks.items);
    } catch (error) {
        messageElement.textContent = error.message;
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Display fetched tracks
function displayTracks(tracks) {
    tracks.forEach(track => {
        const trackElement = document.createElement('div');
        trackElement.className = 'track-card';
        
        trackElement.innerHTML = `
            <h3>${track.name}</h3>
              
            <img src="${track.album.images[0].url}" alt="${track.name}">
            <button onclick="togglePlay('${track.preview_url}')">Play</button>
        `;
        
        tracksContainer.appendChild(trackElement);
        imageback.remove();
    });
}

// Toggle play and pause functionality
function togglePlay(previewUrl) {
    if (currentAudio) {
        // If a song is already playing, stop it before starting a new one
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset to the beginning
    }

    // If the same song is clicked again, toggle play/pause
    if (currentAudio && currentAudio.src === previewUrl) {
        if (isPlaying) {
            currentAudio.pause();
            isPlaying = false;
        } else {
            currentAudio.play();
            isPlaying = true;
        }
        return;
    }

    // Start a new song
    currentAudio = new Audio(previewUrl);
    currentAudio.play();
    isPlaying = true;

    // Update the button text (this can be customized as needed)
    const buttons = document.querySelectorAll('.track-card button');
    buttons.forEach(button => {
        if (button.innerText === 'Pause') {
            button.innerText = 'Play';
        }
    });
    event.target.innerText = 'Pause'; // Change the button text to 'Pause'
}

// Event listeners
searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    if (query) fetchMusicData(query);
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        resultOffset = 0;
        fetchMusicData(searchInput.value);
    }
});

prevPageButton.addEventListener('click', () => {
    resultOffset = Math.max(0, resultOffset - 21);
    fetchMusicData(searchInput.value);
});

nextPageButton.addEventListener('click', () => {
    resultOffset += 21;
    fetchMusicData(searchInput.value);
});
