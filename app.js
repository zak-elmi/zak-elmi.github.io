// app.js : Core logic of this App

// http constants
const http = {
    StatusOK: 200,
    StatusBadRequest: 400,
    MethodGet: "GET"
}

let TriviaCentral = function(){
    this.correctAnswerIndex = -1
    this.correctAnswerGifIndex = 0
    this.incorrectAnswerGifIndex = 0
    this.correctAnswerGifURLs = []
    this.incorrectAnswerGifURLs = []
    this.init = this.init.bind(this)
    this.callOpenTriviaAPI = this.callOpenTriviaAPI.bind(this)
    this.callGiphyAPI = this.callGiphyAPI.bind(this)
    this.handleReceiveOpenTriviaAPIData = this.handleReceiveOpenTriviaAPIData.bind(this)
    this.handleReceiveGiphyAPIData = this.handleReceiveGiphyAPIData.bind(this)
    this.shuffle = this.shuffle.bind(this)
    this.resetTrivia = this.resetTrivia.bind(this)
}

TriviaCentral.prototype.init = function() {
    this.resetTrivia()

    // call giphy API to retrieve GIFS for the case of correct and not correct
    // store it and just cycle through it
    this.callGiphyAPI("correct", function(data) {
        for(var i = 0, n = data.length; i < n; i++) {
            this.correctAnswerGifURLs.push(data[i].images.original.url)
        }
    }.bind(this))

    this.callGiphyAPI("no", function(data) {
        for(var i = 0, n = data.length; i < n; i++) {
            this.incorrectAnswerGifURLs.push(data[i].images.original.url)
        }
    }.bind(this))

    // add event listeners
    let getAQuestion = document.getElementById("getAQuestion")
    getAQuestion.addEventListener("click", function(event) {
        event.stopPropagation()

        // hide Trivia (maybe previously shown)
        let trivia = document.getElementById("trivia")
        trivia.style.display = "none"

        // disable the 'Get A Question' button to prevent spam
        getAQuestion.disabled = true

        // change the 'Get A Question' button to show the loader
        let spans = getAQuestion.getElementsByTagName("SPAN")
        spans[0].style.display = "none" // spans[0] refers to the 'Get A Question' text
        spans[1].style.display = "block" // spans[1] refers to the loader

        // call open trivia API to retrieve a trivia question
        this.callOpenTriviaAPI(this.handleReceiveOpenTriviaAPIData)
    }.bind(this))

    let submitAnswer = document.getElementById("submitAnswer")
    submitAnswer.addEventListener("click", function(event) {
        event.stopPropagation()

        // hide the submit answer button
        submitAnswer.style.display = "none"

        let answer = document.getElementById("answer")
        // hide the answer
        answer.style.display = "none"

        let answerIsCorrect = parseInt(answer.value) === this.correctAnswerIndex
        
        if(answerIsCorrect) {
            let correct = document.getElementById("correct")
            correct.style.display = "block"
            // show the 'Correct' gif
            let gif = document.getElementById("gif")
            gif.src = this.correctAnswerGifURLs[this.correctAnswerGifIndex]
            ++this.correctAnswerGifIndex
            this.correctAnswerGifIndex %= this.correctAnswerGifURLs.length
        } else {
            let incorrect = document.getElementById("incorrect")
            incorrect.style.display = "block"
            // show the 'No' gif
            let gif = document.getElementById("gif")
            gif.src = this.incorrectAnswerGifURLs[this.incorrectAnswerGifIndex]
            ++this.incorrectAnswerGifIndex
            this.incorrectAnswerGifIndex %= this.incorrectAnswerGifURLs.length
        }
    }.bind(this))
}
       

TriviaCentral.prototype.callOpenTriviaAPI = function(callback) {
    let category = document.getElementById("category")
    let difficulty = document.getElementById("difficulty")

    let url = `https://opentdb.com/api.php?amount=1${category.value !== "0" ? "&category=" + category.value : ""}${difficulty.value !== "any" ? "&difficulty=" + difficulty.value : ""}`

    let xhr = new XMLHttpRequest()
    xhr.open(http.MethodGet, url, true)

    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if(xhr.status === http.StatusOK) {
                callback(JSON.parse(xhr.responseText))
            } else {
                console.error(JSON.parse(xhr.responseText))
            }
        }
    }

    xhr.send()
}

TriviaCentral.prototype.handleReceiveOpenTriviaAPIData = function(data) {
    if(!data.results[0]) {
        // no data received
        console.error("No data received from Open Trivia")
        return
    }

    // populate the question
    let question = document.getElementById("question")
    question.innerHTML = data.results[0].question

    // populate the possible answers
    let possibleAnswers = []
    possibleAnswers.push(data.results[0].correct_answer)
    for(let i = 0, n = data.results[0].incorrect_answers.length; i < n; i++) {
        possibleAnswers.push(data.results[0].incorrect_answers[i])
    }

    // shuffle the array to randomize it
    this.shuffle(possibleAnswers)

    // store the correct answer
    for(let i = 0, n = possibleAnswers.length; i < n; i++) {
        if(possibleAnswers[i] === data.results[0].correct_answer) {
            this.correctAnswerIndex = i
            break
        }
    }
    // populate into answers element
    let answer = document.getElementById("answer")
    // clear previous answers
    answer.innerHTML = ""
    // append the answers
    for(let i = 0, n = possibleAnswers.length; i < n; i++) {
        let option = document.createElement("OPTION")
        option.innerHTML = possibleAnswers[i]
        option.value = i // store the index of the answers as the value
        answer.appendChild(option)
    }

    // call the GIPHY API with the question as the search query
    this.callGiphyAPI(data.results[0].question, this.handleReceiveGiphyAPIData)
}

TriviaCentral.prototype.callGiphyAPI = function(query, callback) {
    let url = `https://api.giphy.com/v1/gifs/search?api_key=uhiiHmlj1qejivlSD0elyYMqidxw4w4I&q=${encodeURIComponent(query)}`

    let xhr = new XMLHttpRequest()
    xhr.open(http.MethodGet, url, true)

    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if(xhr.status === http.StatusOK) {
                callback(JSON.parse(xhr.responseText).data)
            } else {
                console.error(JSON.parse(xhr.responseText))
            }
        }
    }

    xhr.send()
}

TriviaCentral.prototype.handleReceiveGiphyAPIData = function(data) {
    // choose a random index from the data array
    let indexToChoose = Math.floor(Math.random() * data.length)
    let gifToChoose = data[indexToChoose]

    // embed into img
    let gif = document.getElementById("gif")
    gif.src = gifToChoose.images.original.url

    // reset Trivia's state (may be changed due to previous attempts)
    this.resetTrivia()

    // the whole trivia presentation is ready to be shown
    let trivia = document.getElementById("trivia")
    trivia.style.display = "block"

    // re-enable the 'Get A Question' button
    let getAQuestion = document.getElementById("getAQuestion")
    getAQuestion.disabled = false
    // show text and hide loader
    let spans = getAQuestion.getElementsByTagName("SPAN")
    spans[0].style.display = "block" // spans[0] refers to the 'Get A Question' text
    spans[1].style.display = "none" // spans[1] refers to the loader
}

TriviaCentral.prototype.shuffle = function(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

TriviaCentral.prototype.resetTrivia = function() {
    // hide previously (maybe) shown elements we do not want to show now
    let correct = document.getElementById("correct")
    let incorrect = document.getElementById("incorrect")
    correct.style.display = "none"
    incorrect.style.display = "none"

    // the answer select dropdown should be shown
    let answer = document.getElementById("answer")
    answer.style.display = "block"

    // the submit button's text should switch back to show 'Submit Answer'
    let submitAnswer = document.getElementById("submitAnswer")
    let spans = submitAnswer.getElementsByTagName("SPAN")
    spans[0].style.display = "block" // spans[0] refers to the 'Submit' text
    spans[1].style.display = "none" // spans[1] refers to the loader

    // show the 'Submit Answer' button
    submitAnswer.style.display = "block"
}

window.addEventListener("load", function() {
    new TriviaCentral().init()
})