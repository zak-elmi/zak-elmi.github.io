  
from flask import Flask, request, Response, render_template
import requests
import itertools
from flask_wtf.csrf import CSRFProtect
from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, SubmitField
from wtforms.validators import Regexp
import re

class WordForm(FlaskForm):
    avail_letters = StringField("Letters", validators= [
        Regexp(r'^[a-z]+$', message="must contain letters only")
    ])
    word_size = SelectField(u'Word Length', choices=[('any','Any'),('3','3'),('4','4'),('5','5'),('6','6'),('7','7'),('8','8'),('9','9'),('10','10')])
    pattern = StringField("Pattern")
    submit = SubmitField("Submit")


csrf = CSRFProtect()
app = Flask(__name__)
app.config["SECRET_KEY"] = "row the boat"
csrf.init_app(app)

@app.route('/index')
def index():
    form = WordForm()
    return render_template("index.html", form=form)


@app.route('/words', methods=['POST','GET'])
def letters_2_words():

    form = WordForm()
    if form.validate_on_submit():
        letters = form.avail_letters.data
        word_size = form.word_size.data
        pattern = form.pattern.data
    else:
        return render_template("index.html", form=form)

    with open('sowpods.txt') as f:
        good_words = set(x.strip().lower() for x in f.readlines())

    word_set = set()
    letters_len = len(letters)
    pattern_len = len(pattern)
    if letters_len > 0 and pattern_len == 0 and word_size == "any":
        for l in range(3,len(letters)+1):
            for word in itertools.permutations(letters,l):
             w = "".join(word)
             if w in good_words:
                 word_set.add(w)
    elif letters_len > 0 and pattern_len == 0 and word_size != "any":
        word_choice = int(word_size)
        for l in range(3,len(letters)+1):
            for word in itertools.permutations(letters,word_choice):
             w = "".join(word)
             if w in good_words:
                 word_set.add(w)
    elif letters_len > 0 and pattern_len > 0:
        for word in itertools.permutations(letters, pattern_len):
            w = "".join(word)
            if bool(re.match(pattern, w)) and w in good_words:
                word_set.add(w)
    elif letters_len == 0:
        for word in good_words:
            w = "".join(word)
            if len(w) == pattern_len and bool(re.match(pattern, w)):
                word_set.add(w)
    word_set = sorted(word_set)
    word_set = sorted(word_set, key=len)
    return render_template('wordlist.html',
        wordlist=word_set,
        name="CS4131")



@app.route('/words/definition/<word>')
def defineWord(word):
    api_key = "30db501d-0e1b-4a6c-b5e6-f651c47b270f"
    url = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/{}?key={}".format(word, api_key)
    resp = requests.get(url)
    return Response (resp.text, status = resp.status_code, content = resp.headers["content-type"],)


@app.route('/proxy')
def proxy():
    result = requests.get(request.args['url'])
    resp = Response(result.text)
    resp.headers['Content-Type'] = 'application/json'
    return resp
