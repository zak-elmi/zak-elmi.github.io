function validEntry () {
    var letters = document.getElementById("avail_letters")
    var word_len = document.getElementById("word_size")
    var pattern = document.getElementById("pattern")
    var message = document.getElementById("message")   


     if(letters.value.length > 0 && word_len.value !== "any" && parseInt(word_len.value) > letters.value.length) {
        message.innerText = "Uh-Oh! To continue with the WordFinder, the letters entered must have a length that is greater than or equal to the word length."
        message.classList.remove("hidden")
        return false
    }

        if(letters.value.length > 0 && letters.value.length < pattern.value.length) {
            message.innerText = "Uh-Oh! To continue with the WordFinder , the letters entered must have a length that is greater than or equal to the attern"
            message.classList.remove("hidden")
            return false
        }

    if(letters.value === "" && pattern.value === "") {
        message.innerText = "Uh-Oh! To continue with the WordFinder, you must provide either a value for letters or pattern."
        message.classList.remove("hidden")
        return false
    }

    if(word_len.value !== "any" && pattern.value.length > 0 && parseInt(word_len.value) !== pattern.value.length) {
        message.innerText = "Uh-Oh! To continue with the WordFinder, the pattern's length has to match the word length."
        message.classList.remove("hidden")
        return false
    }

  messge.classList.add("hidden")
  return true
}