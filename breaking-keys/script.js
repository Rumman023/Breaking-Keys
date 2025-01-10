const sentenceEl = document.getElementById("sentence");
const typedTextEl = document.getElementById("typed-text");
const inputBox = document.getElementById("input-box");
const timeTakenEl = document.getElementById("time-taken");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const typingArea = document.querySelector('.typing-area');
const restartBtn = document.getElementById("restart-btn");

// Replace the static sentences array with dynamic sentence generation
const nlp = window.nlp;

// Update the templates and vocabulary with topics
const topics = {
    programming: {
        templates: [
            'The #Adjective# #Noun# #Verb# #Preposition# the #Adjective# #Noun#.',
            '#ProperNoun# #Verb# #Preposition# the #Noun# #TimePhrase#.',
            'The #Noun# #Verb# the #Adjective# #Noun# #Adverb#.'
        ],
        vocabulary: {
            Adjective: ['efficient', 'complex', 'elegant', 'robust', 'dynamic', 'scalable', 'modular', 'secure'],
            Noun: ['developer', 'algorithm', 'function', 'database', 'framework', 'system', 'code', 'application'],
            Verb: ['optimizes', 'implements', 'debugs', 'deploys', 'maintains', 'refactors', 'designs', 'tests'],
            ProperNoun: ['The programmer', 'The developer', 'The engineer', 'The team'],
            TimePhrase: ['systematically', 'efficiently', 'step by step', 'continuously'],
            Adverb: ['efficiently', 'carefully', 'precisely', 'systematically'],
            Preposition: ['with', 'using', 'through', 'by']
        }
    },
    nature: {
        templates: [
            'The #Adjective# #Noun# #Verb# #Preposition# the #Adjective# #Noun#.',
            'A #Adjective# #Noun# #Verb# as the #Noun# #Verb# #Adverb#.',
            '#ProperNoun# #Verb# #Preposition# the #Adjective# #Noun#.'
        ],
        vocabulary: {
            Adjective: ['gentle', 'wild', 'peaceful', 'colorful', 'majestic', 'serene', 'vibrant', 'tranquil'],
            Noun: ['river', 'mountain', 'forest', 'ocean', 'butterfly', 'flower', 'sunset', 'breeze'],
            Verb: ['flows', 'dances', 'sways', 'glows', 'shimmers', 'blooms', 'soars', 'whispers'],
            ProperNoun: ['The sunlight', 'The wind', 'The rain', 'The moon'],
            TimePhrase: ['peacefully', 'gracefully', 'naturally', 'endlessly'],
            Adverb: ['gently', 'softly', 'gracefully', 'quietly'],
            Preposition: ['through', 'over', 'beneath', 'around']
        }
    },
    science: {
        templates: [
            'The #Adjective# #Noun# #Verb# #Preposition# the #Adjective# #Noun#.',
            '#ProperNoun# #Verb# that the #Noun# #Verb# #Adverb#.',
            'A #Adjective# #Noun# #Verb# when #ProperNoun# #Verb#.'
        ],
        vocabulary: {
            Adjective: ['quantum', 'molecular', 'chemical', 'atomic', 'neural', 'genetic', 'cosmic', 'theoretical'],
            Noun: ['particle', 'reaction', 'molecule', 'electron', 'galaxy', 'experiment', 'theory', 'element'],
            Verb: ['interacts', 'transforms', 'evolves', 'accelerates', 'orbits', 'expands', 'mutates', 'reacts'],
            ProperNoun: ['The scientist', 'The researcher', 'The discovery', 'The experiment'],
            TimePhrase: ['consistently', 'repeatedly', 'theoretically', 'experimentally'],
            Adverb: ['rapidly', 'predictably', 'significantly', 'theoretically'],
            Preposition: ['with', 'through', 'under', 'during']
        }
    },
    breakingBad: {
        templates: [
            'The #Adjective# #ProperNoun# #Verb# #Preposition# the #Adjective# #Noun#.',
            '#ProperNoun# #Verb# the #Adjective# #Noun# #TimePhrase#.',
            'The #Noun# #Verb# #Adverb# #Preposition# the #Adjective# #ProperNoun#.'
        ],
        vocabulary: {
            Adjective: ['mysterious', 'dangerous', 'brilliant', 'ruthless', 'determined', 'calculated', 'infamous', 'clandestine'],
            Noun: ['chemistry', 'empire', 'laboratory', 'desert', 'crystal', 'money', 'cartel', 'operation'],
            Verb: ['cooks', 'builds', 'creates', 'manufactures', 'controls', 'expands', 'dominates', 'transforms'],
            ProperNoun: ['Walter White', 'Heisenberg', 'Jesse Pinkman', 'Gus Fring', 'Saul Goodman'],
            TimePhrase: ['methodically', 'in the desert', 'under pressure', 'with precision', 'in Albuquerque'],
            Adverb: ['carefully', 'secretly', 'masterfully', 'strategically', 'meticulously'],
            Preposition: ['with', 'through', 'in', 'under', 'behind']
        }
    }
};

function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

function adjustForMobile() {
    if (isTouchDevice()) {
        // Remove the click requirement for mobile
        typingArea.classList.add('active');
        inputBox.focus();
    }
}

function generateSentence() {
    // Select random topic
    const topicKeys = Object.keys(topics);
    const selectedTopic = topics[topicKeys[Math.floor(Math.random() * topicKeys.length)]];
    
    // Select random template from the chosen topic
    const template = selectedTopic.templates[Math.floor(Math.random() * selectedTopic.templates.length)];
    let sentence = template;

    // Replace tags with words from the selected topic's vocabulary
    Object.keys(selectedTopic.vocabulary).forEach(tag => {
        const regex = new RegExp(`#${tag}#`, 'g');
        while (sentence.match(regex)) {
            const words = selectedTopic.vocabulary[tag];
            const word = words[Math.floor(Math.random() * words.length)];
            sentence = sentence.replace(regex, word);
        }
    });

    // Use compromise to ensure proper grammar
    const doc = nlp(sentence);
    return doc.text();
}

let startTime;
let isTestActive = false;
let totalTypedChars = 0;
let totalMistakes = 0;
let currentSentence = "";
let previousLength = 0;
let timerInterval;

// Add hint text
const hintText = document.createElement('div');
hintText.className = 'typing-hint';
hintText.textContent = 'Click here to start typing';
typingArea.appendChild(hintText);

// Initialize
function init() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    currentSentence = generateSentence();
    
    // Limit sentence length on mobile
    if (window.innerWidth <= 768) {
        while (currentSentence.length > 100) {
            currentSentence = generateSentence();
        }
    }
    
    const chars = currentSentence.split('');
    const displayText = chars.map(char => `<span class="char">${char}</span>`).join('');
    typedTextEl.innerHTML = displayText;
    
    totalTypedChars = 0;
    totalMistakes = 0;
    previousLength = 0;
    timeTakenEl.textContent = "0";
    wpmEl.textContent = "0";
    accuracyEl.textContent = "0";
    
    inputBox.value = "";
    isTestActive = false;
    
    if (!isTouchDevice()) {
        typingArea.classList.remove('active');
    }
    
    // Ensure keyboard is shown on mobile
    if (isTouchDevice()) {
        setTimeout(() => {
            inputBox.focus();
        }, 100);
    }
}

// Handle input
inputBox.addEventListener("input", (e) => {
    if (!isTestActive) {
        startTime = new Date().getTime();
        isTestActive = true;
        timerInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            const timeElapsed = (currentTime - startTime) / 1000;
            timeTakenEl.textContent = timeElapsed.toFixed(2);
        }, 10);
    }

    const typedText = e.target.value;
    const currentLength = typedText.length;
    
    if (currentLength > previousLength) {
        const lastCharIndex = currentLength - 1;
        if (typedText[lastCharIndex] !== currentSentence[lastCharIndex]) {
            totalMistakes++;
        }
    }
    
    previousLength = currentLength;
    totalTypedChars = Math.max(totalTypedChars, currentLength);

    // Create character-by-character overlay
    let displayText = "";
    const chars = currentSentence.split('');
    chars.forEach((char, index) => {
        if (index < typedText.length) {
            const typedChar = typedText[index];
            const className = typedChar === char ? 'correct' : 'incorrect';
            displayText += `<span class="char">${char}<span class="${className}">${typedChar}</span></span>`;
        } else {
            displayText += `<span class="char">${char}</span>`;
        }
    });
    
    typedTextEl.innerHTML = displayText;

    updateResults();

    if (typedText === currentSentence) {
        endTest();
    }
});

function updateResults() {
    if (totalTypedChars === 0) {
        accuracyEl.textContent = "0";
        return;
    }

    const accuracy = Math.max(0, ((totalTypedChars - totalMistakes) / totalTypedChars) * 100);
    accuracyEl.textContent = accuracy.toFixed(2);

    if (isTestActive) {
      const currentTime = new Date().getTime();
      const timeElapsed = (currentTime - startTime) / 1000; // in seconds
      const wordsTyped = (totalTypedChars - totalMistakes) / 5;
      const wpm = Math.round((wordsTyped / (timeElapsed / 60))); // Gross WPM, accounting for mistakes
      wpmEl.textContent = wpm;
  }
}

function endTest() {
    isTestActive = false;
    inputBox.blur();
    typingArea.classList.remove('active');
    clearInterval(timerInterval);
    
    const endTime = new Date().getTime();
    const timeTaken = (endTime - startTime) / 1000;
    const wordsTyped = (totalTypedChars - totalMistakes) / 5;
    const wpm = Math.round((wordsTyped / timeTaken) * 60);
    
    timeTakenEl.textContent = timeTaken.toFixed(2);
    wpmEl.textContent = wpm;
}

// Prevent paste
inputBox.addEventListener("paste", (e) => {
    e.preventDefault();
});

// Start new test when pressing Enter
document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key.toLowerCase() === "r") && !isTestActive) {
        init();
    }
});

// Add click event listener to typing area
typingArea.addEventListener("click", () => {
    inputBox.focus();
    typingArea.classList.add('active');
});

// Add touch event handlers
typingArea.addEventListener("touchstart", (e) => {
    e.preventDefault();
    inputBox.focus();
    typingArea.classList.add('active');
});

// Add click handler for restart button
restartBtn.addEventListener("click", () => {
    init();
});

// Initialize on page load
init();

// Add these event listeners
window.addEventListener('load', adjustForMobile);
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        adjustForMobile();
    }
});

// Handle virtual keyboard issues
window.addEventListener('resize', () => {
    // Adjust container position when virtual keyboard appears
    if (document.activeElement === inputBox) {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
    }
});

