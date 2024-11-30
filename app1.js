// Word banks
import { words } from './words.js';

import { accessibilityWords } from './accessibility-words.js';

import { gameConfig } from './config.js';

// Get the modal and close button
var modal = document.getElementById('info-modal');
var closeButton = document.querySelector('.close');
var infoButton = document.querySelector('.info-btn');

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



// Function to get a random word from the accessibility list
var randomWord = function () {
    let unusedWords = accessibilityWords.filter(wordData => 
        !gameConfig.usedWords.includes(wordData.word.toLowerCase())
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
    if (gameConfig.playedRounds >= gameConfig.maxRounds) {
        alertBox.classList.toggle('active');
        alertBox.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: red; font-size: 40px; margin-bottom: 10px;">Game Over!</h2>
                <p style="font-size: 35px;">You have played all ${gameConfig.maxRounds} rounds.</p>
                <p style="font-size: 35px;">Thank you for playing!</p>
            </div>
        `;
        disableButtons();  // Disable gameplay buttons
        return;  // Do not proceed with resetting the board or starting a new game
    }

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

    // Select a new correct word and ensure it hasn't been used before
    do {
        correctWordData = randomWord();  // Get a random word
    } while (gameConfig.usedWords.includes(correctWordData.word.toLowerCase()));

    correctWord = correctWordData.word.toLowerCase(); // Set the new correct word
    gameConfig.usedWords.push(correctWord);  // Add the word to the used words list

    // Increment the played rounds **only after selecting a new word**
    

    // Reset the modal after game over
    modal.style.display = 'none';
}

// New Game button functionality
newGame.addEventListener("click", function () {

    gameConfig.playedRounds++;
    // Ensure that rounds have not been exceeded
    if (gameConfig.playedRounds < gameConfig.maxRounds) {
        resetGameBoard();  // Reset the game board
        newGame.style.display = "none";  // Hide the "New Game" button after it's clicked
        scoreDisplay.innerText = score;  // Ensure score is displayed correctly
    }
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
                        newGame.addEventListener("click", function () {
                            resetGameBoard();  // Reset the game state (not the score)
                            newGame.style.display = "none";  // Hide the "New Game" button after it's clicked
                        });
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
                        newGame.addEventListener("click", function () {
                            resetGameBoard();  // Reset the game state (not the score)
                            newGame.style.display = "none";  // Hide the "New Game" button after it's clicked
                        });
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
let score = 0;

// Reference to score display and reset button
const scoreDisplay = document.getElementById('score');
const resetScoreButton = document.querySelector('.reset-score');

// Function to update score display
function updateScoreDisplay() {
    scoreDisplay.innerText = score;
}

// Increment score on win
function onWin() {
    score += 10;  // Add points for winning
    updateScoreDisplay();
}

// Decrement score on loss
function onLoss() {
    score -= 5;   // Deduct points for losing
    updateScoreDisplay();
}

// Reset score button functionality
resetScoreButton.addEventListener('click', function() {
    score = 0;
    updateScoreDisplay();
});









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




