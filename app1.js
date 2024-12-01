// Word banks
import { words } from './words.js';

import { accessibilityWords } from './accessibility-words.js';

var userID;
var gameID;

const params = new URLSearchParams(window.location.search);

if (params.has('userId')) {
    userID = params.get('userId');
    sessionStorage.setItem('user-id', userID);
} else {
    window.location.href = cloudURL;
}

// var currentRound = gameConfig.playedRounds + 1
// document.getElementById('question_number').innerHTML = "Question: " + String(currentRound);

async function createGameDocument() {
    try {
        const response = await fetch(cloudURL + '/createDocument', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ collectionName: collectionName })
        });

        const data = await response.json();
        gameID = data.documentId;
        console.log("New game document created with ID:", gameID);
        sessionStorage.setItem("gameID", gameID);
        await fetchPlayerData();
    } catch (error) {
        console.error("Error creating document:", error);
    }
}

async function fetchPlayerData() {
    try {
        const response = await fetch(cloudURL + `/getDocumentData?collectionName=player-data&id=${userID}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.length > 0) {
            const previousGames = data[0].accessibilityWorlde || [];
            previousGames.push(gameID);
            sessionStorage.setItem('previous-games', JSON.stringify(previousGames));
            await updatePlayerData(previousGames);
        } else {
            console.error("No data found for the given document ID");
        }
    } catch (error) {
        console.error("Error fetching document data:", error);
    }
}

async function updatePlayerData(previousGames) {
    try {
        const response = await fetch(cloudURL + `/addDocumentData?collectionName=player-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: sessionStorage.getItem('user-id'),
                accessibilityWorlde: previousGames
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data added successfully:", data);
    } catch (error) {
        console.error("Error adding data:", error);
    }
}

if(sessionStorage.getItem('gameID') == null){
    createGameDocument();
} else {
    gameID = sessionStorage.getItem('gameID');
}

async function fbAdd(fieldKey, fieldValue) {
    try {
        const response = await fetch(cloudURL + `/addDocumentData?collectionName=${collectionName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: gameID,
                [fieldKey]: fieldValue
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Data added successfully:", data);

    } catch (error) {
        console.error("Error adding data:", error);
    }
}

// Get the modal and close button
var modal = document.getElementById('info-modal');
var closeButton = document.querySelector('.close');
var infoButton = document.querySelector('.info-btn');

if (!sessionStorage.getItem('playedRounds')) {
    sessionStorage.setItem('playedRounds', 0);
} else if (parseInt(sessionStorage.getItem('playedRounds')) >= gameConfig.maxRounds){
    const keyToKeep = "user-id";
    const valueToKeep = sessionStorage.getItem(keyToKeep);

    sessionStorage.clear();

    if (valueToKeep !== null) {
        sessionStorage.setItem(keyToKeep, valueToKeep);
    }

    window.location.reload();
}

if (!sessionStorage.getItem('score')) {
    sessionStorage.setItem('score', 0);
}

if (!sessionStorage.getItem('usedWords')) {
    sessionStorage.setItem('usedWords', JSON.stringify([]));
}

// Show the modal when the "Info" button is clicked
infoButton.addEventListener('click', function () {
    modal.style.display = 'flex';
});

// Hide the modal when the "close" button is clicked
closeButton.addEventListener('click', function () {
    modal.style.display = 'none';
});

// Hide the modal when clicking outside of the modal content
window.addEventListener('click', function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

var playedRounds = parseInt(sessionStorage.getItem("playedRounds")) + 1;
document.getElementById("question-number").innerText = "Q" + playedRounds + ".";


// Function to get a random word from the accessibility list
var randomWord = function () {
    let usedWords = JSON.parse(sessionStorage.getItem("usedWords")) || [];
    let unusedWords = accessibilityWords.filter(wordData => 
        !usedWords.includes(wordData.word.toLowerCase())
    );
    var randomIndex = Math.floor(Math.random() * unusedWords.length);
    return unusedWords[randomIndex];
};


var correctWordData = randomWord();  // Get the word and its fact
var correctWord = correctWordData.word.toLowerCase();  // Get the correct word only

var guessedWord = "";
var idx = 0;
var guess = 0;
var buttons = document.querySelectorAll("button");
var alertBox = document.querySelector(".alert");
var newGame = document.querySelector(".new");

// Disable buttons after the game ends
var disableButtons = function () {
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
};


// Function to reset the game board and handle new rounds
function resetGameBoard() {
    // Check if the maximum rounds have been played before starting a new game
    if (parseInt(sessionStorage.getItem("playedRounds")) >= gameConfig.maxRounds) {
        alert("Game Over!");
        alertBox.classList.toggle('active');
        alertBox.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: red; font-size: 40px; margin-bottom: 10px;">Game Over!</h2>
                <p style="font-size: 35px;">You have played all ${gameConfig.maxRounds} rounds.</p>
                <p style="font-size: 35px;">Thank you for playing!</p>
                <button onclick="location.reload();" style="width: 100px;">PLAY AGAIN</button>
            </div>
        `;
        disableButtons();  // Disable gameplay buttons
        return;  // Do not proceed with resetting the board or starting a new game
    }

    var playedRounds = parseInt(sessionStorage.getItem("playedRounds")) + 1;
    document.getElementById("question-number").innerText = "Q" + playedRounds + ".";

    guessedWord = ""; // Reset guessed word
    guess = 0; // Reset guess count
    idx = 0; // Reset index

    // Clear the game board and prepare for the next round
    document.querySelectorAll('.word div').forEach(div => {
        div.innerHTML = '';
        div.classList.remove('correct', 'present', 'incorrect', 'scale');
    });

    // Reset buttons' states
    document.querySelectorAll('button').forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'present', 'incorrect');
    });

    let usedWords = JSON.parse(sessionStorage.getItem("usedWords")) || [];
    usedWords.push(correctWord);
    sessionStorage.setItem("usedWords", JSON.stringify(usedWords));

    // Select a new correct word and ensure it hasn't been used before  
    correctWordData = randomWord();

    correctWord = correctWordData.word.toLowerCase(); // Set the new correct word

    // Increment the played rounds **only after selecting a new word**
    

    // Reset the modal after game over
    modal.style.display = 'none';
}

// New Game button functionality
newGame.addEventListener("click", function () {
    let playedRounds = parseInt(sessionStorage.getItem("playedRounds")) || 0;

    playedRounds += 1;

    sessionStorage.setItem("playedRounds", playedRounds);

    resetGameBoard();  // Reset the game board
    newGame.style.display = "none";  // Hide the "New Game" button after it's clicked
    scoreDisplay.innerText = parseInt(sessionStorage.getItem("score"));  // Ensure score is displayed correctly
    newGame.style.display = "none";
});





// Function to check if a word is valid
function includes(word, words) {
    for (var i = 0; i < words.length; i++) {
        if (word === words[i])
            return true;
    }
    return false;
}

// Button click event listener
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function (e) {
        var target = e.target;
        var letter = target.innerText;
        if (letter === 'Clear') {
            if (idx > 0 && guess < 6) {
                idx--;
                var letterDiv = document.querySelector(".character_" + guess + idx);
                letterDiv.innerHTML = "";
                letterDiv.classList.toggle("scale");
                guessedWord = guessedWord.slice(0, idx);
            }
        }
        else if (letter === 'Enter') {
            if (idx == correctWord.length) {
                if (!includes(guessedWord.toLowerCase(), words)) {
                    alertBox.classList.toggle('active');
                    alertBox.innerHTML = "Word not in the list!";
                    setTimeout(function () {
                        alertBox.classList.toggle('active');
                    }, 2000);
                } else {
                    var match = [0, 0, 0, 0, 0]; // 1 => match, 0 => not match, 2 => present
                    guessedWord = guessedWord.toLowerCase();

                    // Match letters with the correct word
                    for (var i_1 = 0; i_1 < correctWord.length; i_1++) {
                        if (guessedWord[i_1] === correctWord[i_1]) {
                            match[i_1] = 1;
                        }
                    }

                    var map = {};
                    for (var i_2 = 0; i_2 < correctWord.length; i_2++) {
                        if (match[i_2] !== 1) {
                            if (map[correctWord[i_2]]) {
                                map[correctWord[i_2]]++;
                            } else {
                                map[correctWord[i_2]] = 1;
                            }
                        }
                    }

                    for (var i_3 = 0; i_3 < guessedWord.length; i_3++) {
                        if (match[i_3] !== 1 && map[guessedWord[i_3]]) {
                            match[i_3] = 2;
                            map[guessedWord[i_3]]--;
                        }
                    }

                    // Update letter tiles and buttons
                    for (var i_4 = 0; i_4 < correctWord.length; i_4++) {
                        var letterDiv = document.querySelector(".character_" + guess + i_4);
                        var button = document.querySelector("#" + guessedWord[i_4].toUpperCase());
                        if (match[i_4] === 0) {
                            letterDiv.classList.add("incorrect");
                            button.classList.add("incorrect");
                        } else if (match[i_4] === 1) {
                            letterDiv.classList.add("correct");
                            button.classList.add("correct");
                        } else if (match[i_4] === 2) {
                            letterDiv.classList.add("present");
                            button.classList.add("present");
                        }
                    }

                    // Check if the game is won
                    if (guessedWord === correctWord) {
                        onWin();
                        alertBox.classList.toggle('active');
                        alertBox.innerHTML = `
                          <div style="position: relative; text-align: center; padding: 20px;">
    <h2 style="color: #4CAF50; font-size: 24px; margin-bottom: 10px;">Congrats! You won!</h2>
    <p style="font-size: 30px;">The word was: <span style="font-weight: bold; color: #ff9900;"> ${correctWord.toUpperCase()}</p>
    <p style="font-size: 30px; margin-top: 20px;">Fact: <span style="color: #2196F3;">${correctWordData.fact}</span></p>
    
    <!-- Close button styled as a small cross in the top-right corner -->
    <span id="closeAlert" style="position: absolute; top: 10px; right: 10px; font-size: 20px; cursor: pointer; color: #ffffff;">&times;</span>
</div>

                        `;
                    
                        // Close the alert box when the close button is clicked
                        const closeBtn = document.getElementById('closeAlert');
                        closeBtn.addEventListener('click', function() {
                            alertBox.classList.remove('active');  // Close the alert box
                        });
                    
                        disableButtons();
                        newGame.style.display = "block";
                        // newGame.addEventListener("click", function () {
                        //     resetGameBoard();  // Reset the game state (not the score)
                        //     newGame.style.display = "none";  // Hide the "New Game" button after it's clicked
                        // });
                        return;
                    }
                    
                    // Check if the game is lost
                    else if (guess === 5) {
                        onLoss();
                        alertBox.classList.toggle('active');
                        alertBox.innerHTML = `
                            <div style="text-align: center; padding: 20px;">
                                <h2 style="color: red; font-size: 24px; margin-bottom: 10px;">Sorry! You lost!</h2>
                                <p style="font-size: 30px;">The word was: <span style="font-weight: bold; color: #ff9900;">${correctWord.toUpperCase()}</span></p>
                                <p style="font-size: 30px; margin-top: 20px;">Fact: <span style="color: #2196F3;">${correctWordData.fact}</span></p>
                                <span id="closeAlert" style="position: absolute; top: 10px; right: 10px; font-size: 20px; cursor: pointer; color: #ffffff;">&times;</span>
                            </div>
                        `;
                    
                        // Close the alert box when the close button is clicked
                        const closeBtnLoss = document.getElementById('closeAlert');
                        closeBtnLoss.addEventListener('click', function() {
                            alertBox.classList.remove('active');  // Close the alert box
                        });
                    
                        disableButtons();  // Disable all buttons after the game ends
                        newGame.style.display = "block";  // Show the "New Game" button
                    
                        // Update the "New Game" button functionality
                        // newGame.addEventListener("click", function () {
                        //     resetGameBoard();  // Reset the game state (not the score)
                        //     newGame.style.display = "none";  // Hide the "New Game" button after it's clicked
                        // });
                        return;
                    }
                    
                    

                    guess++;
                    idx = 0;
                    guessedWord = "";
                }
            }
        } else if (idx < correctWord.length) {
            guessedWord += letter;
            var letterDiv = document.querySelector(".character_" + guess + idx);
            letterDiv.innerHTML = letter;
            letterDiv.classList.toggle("scale");
            idx++;
        }
    });
}

// Keyboard event listener
document.addEventListener("keydown", function (e) {
    if (e.key === 'Backspace') {
        var button = document.querySelector("#clear");
        button.click();
    } else if (e.key === 'Enter') {
        var button = document.querySelector("#enter");
        button.click();
    } else if (e.key.match(/[a-z]/i)) {
        var button = document.querySelector("#" + e.key.toUpperCase());
        button.click();
    }
});

// Initialize score variable

// Reference to score display and reset button
const scoreDisplay = document.getElementById('score');
// const resetScoreButton = document.querySelector('.reset-score');

// Function to update score display
function updateScoreDisplay() {
    scoreDisplay.innerText = parseInt(sessionStorage.getItem("score"));
}

updateScoreDisplay();

// Increment score on win
function onWin() {
    var score = parseInt(sessionStorage.getItem("score"));
    score += 10;  // Add points for winning
    sessionStorage.setItem("score", score);
    updateScoreDisplay();
    fbAdd("currentCumulativeScore" + sessionStorage.getItem('playedRounds'), score);
}

// Decrement score on loss
function onLoss() {
    var score = parseInt(sessionStorage.getItem("score"));
    score -= 5;  // Add points for winning
    sessionStorage.setItem("score", score);
    updateScoreDisplay(); 
    fbAdd("currentCumulativeScore" + sessionStorage.getItem('playedRounds'), score);
}

// Reset score button functionality
// resetScoreButton.addEventListener('click', function() {
//     score = 0;
//     updateScoreDisplay();
// });









// Modify win/loss conditions in your game logic
// if (guessedWord === correctWord) {
//     onWin();  // Call onWin function
//     // existing win logic...
// } else if (guess === 5) {
//     onLoss(); // Call onLoss function
//     // existing loss logic...
// }


// Modal functionality


// [Rest of your existing game logic below...]




