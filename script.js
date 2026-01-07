// Global variables
let currentUser = null;
let currentInputType = 'text';

// Check authentication state on page load
auth.onAuthStateChanged((user) => {
  currentUser = user;
  updateUI();
});

// Update UI based on authentication state
function updateUI() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const historyBtn = document.getElementById('historyBtn');
  const userEmail = document.getElementById('userEmail');

  if (currentUser) {
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    historyBtn.style.display = 'block';
    userEmail.textContent = currentUser.email;
    userEmail.style.display = 'block';
  } else {
    loginBtn.style.display = 'block';
    signupBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    historyBtn.style.display = 'none';
    userEmail.style.display = 'none';
  }
}

// Tab switching
function switchTab(type) {
  currentInputType = type;
  const textTab = document.querySelector('.tab-btn:first-child');
  const urlTab = document.querySelector('.tab-btn:last-child');
  const textSection = document.getElementById('textSection');
  const urlSection = document.getElementById('urlSection');

  if (type === 'text') {
    textTab.classList.add('active');
    urlTab.classList.remove('active');
    textSection.classList.add('active');
    urlSection.classList.remove('active');
  } else {
    textTab.classList.remove('active');
    urlTab.classList.add('active');
    textSection.classList.remove('active');
    urlSection.classList.add('active');
  }
}

// Modal functions
function showLoginModal() {
  document.getElementById('loginModal').classList.add('active');
}

function showSignupModal() {
  document.getElementById('signupModal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  document.getElementById(modalId.replace('Modal', 'Error')).textContent = '';
}

// Authentication functions
async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');

  try {
    await auth.signInWithEmailAndPassword(email, password);
    closeModal('loginModal');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}

async function signup() {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const errorDiv = document.getElementById('signupError');

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    closeModal('signupModal');
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}

async function logout() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Fetch text content from URL (using a CORS proxy or backend)
async function fetchTextFromURL(url) {
  try {
    // Using a CORS proxy - in production, use your own backend
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    // Parse HTML and extract text
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    // Remove script and style elements
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Extract text from main content areas
    const article = doc.querySelector('article') || 
                   doc.querySelector('.article') || 
                   doc.querySelector('.content') ||
                   doc.querySelector('main') ||
                   doc.body;
    
    return article.innerText || article.textContent || '';
  } catch (error) {
    throw new Error('Failed to fetch content from URL. Please try pasting the text directly.');
  }
}

// Main function to check news
async function checkNews() {
  const resultDiv = document.getElementById("result");
  const checkBtn = document.getElementById("checkBtn");
  
  let newsText = '';
  let sourceUrl = '';

  // Get input based on current tab
  if (currentInputType === 'url') {
    const url = document.getElementById("urlInput").value.trim();
    if (!url) {
      resultDiv.className = "error";
      resultDiv.textContent = "Please enter a URL to analyze.";
      return;
    }
    sourceUrl = url;
    resultDiv.className = "analyzing";
    resultDiv.textContent = "Fetching content from URL...";
    checkBtn.disabled = true;
    
    try {
      newsText = await fetchTextFromURL(url);
      if (!newsText || newsText.trim().length < 50) {
        throw new Error('Could not extract sufficient text from the URL. Please try pasting the text directly.');
      }
    } catch (error) {
      resultDiv.className = "error";
      resultDiv.textContent = error.message;
      checkBtn.disabled = false;
      return;
    }
  } else {
    newsText = document.getElementById("newsInput").value.trim();
    if (!newsText) {
      resultDiv.className = "error";
      resultDiv.textContent = "Please enter some news text to analyze.";
      return;
    }
  }

  resultDiv.className = "analyzing";
  resultDiv.textContent = "Analyzing...";
  checkBtn.disabled = true;

  const API_KEY = "AIzaSyAgk64X6SA1ImgKAqBWberD_3AwwUFUEwA";

  const prompt = `
You are a fact-checking AI.

Analyze the following news text and classify it as:
- Real
- Fake
- Misleading

Provide:
1. Classification
2. Confidence (0-100)
3. Short explanation

News:
"""${newsText}"""
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    
    // Extract the response text from Gemini API structure
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const resultText = data.candidates[0].content.parts[0].text;
      
      // Format the response for better readability
      const formattedText = formatResponse(resultText);
      resultDiv.className = "";
      resultDiv.textContent = formattedText;
      
      // Save to history if user is logged in
      if (currentUser) {
        await saveToHistory(newsText, formattedText, sourceUrl);
      }
    } else {
      resultDiv.className = "error";
      resultDiv.textContent = "Error: Unexpected API response format";
    }
  } catch (error) {
    resultDiv.className = "error";
    resultDiv.textContent = "Error: " + error.message;
    console.error("Error details:", error);
  } finally {
    checkBtn.disabled = false;
  }
}

// Save detection to Firestore
async function saveToHistory(newsText, resultText, url = '') {
  try {
    await db.collection('detections').add({
      userId: currentUser.uid,
      userEmail: currentUser.email,
      newsText: newsText.substring(0, 500), // Store first 500 chars
      result: resultText,
      url: url,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

// Function to format the AI response with proper line breaks
function formatResponse(text) {
  // Replace numbered list items with line breaks
  let formatted = text
    // Add line break before numbered items (1., 2., 3., etc.)
    .replace(/(\d+\.\s)/g, '\n$1')
    // Add line break before "Classification:", "Confidence:", "Short explanation:"
    .replace(/(Classification|Confidence|Short explanation|Explanation):/gi, '\n$1:')
    // Add line break after colons followed by text
    .replace(/:\s*([A-Z])/g, ':\n$1')
    // Clean up multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace
    .trim();
  
  // If the text doesn't have proper formatting, add line breaks after periods followed by numbers
  if (!formatted.includes('\n')) {
    formatted = text
      .replace(/(\d+\.\s)/g, '\n\n$1')
      .replace(/(Classification|Confidence|Explanation):/gi, '\n\n$1:')
      .trim();
  }
  
  return formatted;
}
