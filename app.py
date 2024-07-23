from flask import Flask, request, jsonify, render_template, session
from boggle import Boggle
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)
boggle_game = Boggle()

@app.route('/')
def home():
    """render the home page with a new Boggle board and initialize session variables."""
    board = boggle_game.make_board()
    session['board'] = board
    session['plays'] = session.get('plays', 0)
    session['highscore'] = session.get('highscore', 0)
    return render_template('index.html', board=board)

@app.route('/check-word', methods=['POST'])
def check_word():
    """check if a submitted word is valid on the Boggle board and in the dictionary."""
    data = request.get_json()
    word = data.get('word')
    board = session.get('board')
    if not word or not board:
        return jsonify({'result': 'missing data'}), 400

    result = boggle_game.check_valid_word(board, word)
    return jsonify({'result': result})

@app.route('/end-game', methods=['POST'])
def end_game():
    """update the session with the current score and track the number of games played."""
    data = request.get_json()
    score = data.get('score')
    session['plays'] += 1
    if score > session['highscore']:
        session['highscore'] = score
    return jsonify({
        'plays': session['plays'],
        'highscore': session['highscore']
    })

if __name__ == '__main__':
    app.run(debug=True)
