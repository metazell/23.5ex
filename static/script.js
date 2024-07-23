class BoggleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.guessedWords = new Set();
        this.timerInterval = null;
        this.init();
    }

    init() {
        this.updateTime();
        this.startTimer();
        $('#guess-form').on('submit', this.handleSubmit.bind(this));
    }

    updateScore(points) {
        this.score += points;
        $('#score').text(`Score: ${this.score}`);
    }

    updateTime() {
        $('#timer').text(`Time Left: ${this.timeLeft}s`);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTime();
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                $('#guess-form input, #guess-form button').attr('disabled', true);
                $('#result').text('Time is up! Game over.');
                this.endGame();
            }
        }, 1000);
    }

    handleSubmit(event) {
        event.preventDefault();
        const word = $('#word').val().toLowerCase();
        
        if (this.guessedWords.has(word)) {
            $('#result').text('You already guessed that word!');
            return;
        }

        axios.post('/check-word', { word: word })
            .then(response => {
                const result = response.data.result;
                $('#result').text(result);

                if (result === 'ok') {
                    this.guessedWords.add(word);
                    this.updateScore(word.length);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                $('#result').text('Error checking word');
            });
    }

    endGame() {
        axios.post('/end-game', { score: this.score })
            .then(response => {
                const data = response.data;
                $('#result').append(`<p>Games Played: ${data.plays}</p>`);
                $('#result').append(`<p>High Score: ${data.highscore}</p>`);
            })
            .catch(error => {
                console.error('Error:', error);
                $('#result').text('Error ending game');
            });
    }
}

$(document).ready(function() {
    new BoggleGame();
});
