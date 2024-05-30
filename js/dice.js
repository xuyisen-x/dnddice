function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

// Token Types：
const TokenType = {
    CONST_NUM:"CONST_NUM",          //'2' in '1d20+2'
    NEED_ROLL_NUM:"NEED_ROLL_NUM",  //'1d20' in '1d20+2'
    PLUS:"PLUS",                    //+
    MINUS:"MINUS"                   //-
};

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class NeedRollNum{
    constructor(num, range) {
        assert(num > 0, "num must larger than 0");
        assert(range > 0, "range must larger than 0");
        this.num = num;
        this.range = range;
        this.record = [];
    }
    toString(){
        return `${this.num}d${this.range}`
    }
    roll(){
        this.record = new Array(this.num);
        for (let i = 0; i < this.num; i++)
        {
            this.record[i] = Math.floor(Math.random() * this.range) + 1;
        }
    }
    getResult(){
        if (this.record.length === 0){
            throw Error("you need to call roll first")
        }
        return this.record;
    }
    rollAndGetResult(){
        this.roll();
        return this.getResult();
    }
}

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.currentChar = input[this.position];
    }
    advance() {
        this.position++;
        if (this.position < this.input.length) {
            this.currentChar = this.input[this.position];
        } else {
            this.currentChar = null;
        }
    }
    skipWhitespace() {
        while (this.currentChar !== null && /\s/.test(this.currentChar)) {
            this.advance();
        }
    }
    number() {
        let resultFront = '';
        let resultBehind = '';
        let findD = false;
        while (this.currentChar !== null) {
            if (/\d/.test(this.currentChar)){
                if (findD === false) resultFront += this.currentChar;
                else resultBehind += this.currentChar;
            }
            else if (this.currentChar === 'd'){
                if (findD === false) findD = true;
                else throw Error("found more than 1 d in a token");
            }
            else break;
            this.advance();
        }
        if (findD === false){
            return new Token(TokenType.CONST_NUM, Number(resultFront))
        }
        else
        {
            let front = resultFront === '' ? 1 : Number(resultFront);
            if (resultBehind === '')
                throw Error("there is no number behind d");
            let behind = Number(resultBehind);
            return new Token(TokenType.NEED_ROLL_NUM, new NeedRollNum(front, behind))
        }
    }
    getNextToken() {
        while (this.currentChar !== null) {
            // white space
            if (/\s/.test(this.currentChar)) {
                this.skipWhitespace();
                continue;
            }
            // CONST_NUM or NEED_ROLL_NUM
            if (/\d/.test(this.currentChar) || this.currentChar === 'd') {
                return this.number();
            }
            // PLUS
            if (this.currentChar === '+') {
                this.advance();
                return new Token(TokenType.PLUS, '+');
            }
            // MINUS
            if (this.currentChar === '-') {
                this.advance();
                return new Token(TokenType.MINUS, '-');
            }
            throw new Error(`Unknown character: ${this.currentChar}`);
        }
        return null;
    }
}

class TokenPair{
    constructor(symbolToken, numToken) {
        assert(symbolToken.type === TokenType.PLUS || symbolToken.type === TokenType.MINUS,
            "symbolToken must be PLUS OR MINUS");
        assert(numToken.type === TokenType.NEED_ROLL_NUM || numToken.type === TokenType.CONST_NUM,
            "numToken must be NEED_ROLL_NUM or CONST_NUM");
        this.symbolToken = symbolToken;
        this.numToken = numToken;
    }
    getValue(){
        let num = 0;
        if (this.numToken.type === TokenType.NEED_ROLL_NUM){
            for (let i of this.numToken.value.getResult())
                num += i;
        }
        else {
            num = this.numToken.value;
        }
        if (this.symbolToken.type === TokenType.MINUS) return -num;
        return num;
    }
    roll(){
        if (this.numToken.type === TokenType.NEED_ROLL_NUM){
            this.numToken.value.roll();
        }
    }
    rollAndGetValue(){
        this.roll();
        return this.getValue();
    }
    toString(){
        if (this.symbolToken.type === TokenType.PLUS)
            return `${this.numToken.value}`
        return `${this.symbolToken.value}${this.numToken.value}`
    }
}

class Dice{
    constructor(inputStr) {
        let token;
        let tokens = [];
        let laxer = new Lexer(inputStr);
        while((token = laxer.getNextToken()) !== null){
            if (tokens.length === 0 &&
                (token.type === TokenType.CONST_NUM || token.type === TokenType.NEED_ROLL_NUM))
                tokens.push(new Token(TokenType.PLUS, '+'));
            tokens.push(token);
        }
        assert(tokens.length % 2 === 0, "length of tokens must be even");
        this.tokenPairs = [];
        for (let i = 0; i < tokens.length; i += 2){
            this.tokenPairs.push(new TokenPair(tokens[i], tokens[i+1]));
        }
    }
    getResult(){
        let sum = 0;
        for (let i of this.tokenPairs){
            sum += i.getValue();
        }
        return sum
    }
    roll(){
        for (let i of this.tokenPairs){
            i.roll();
        }
    }
    rollAndGetResult(){
        this.roll();
        return this.getResult();
    }
    getRecord(){
        let record = "";
        for (let i of this.tokenPairs){
            record += i.toString();
            record += ":";
            if (i.numToken.type === TokenType.CONST_NUM)
                record += i.numToken.value;
            else
                record += i.numToken.value.record;
            record += "\n";
        }
        return record;
    }
    getRecord2(){
        let record = "";
        for (let i of this.tokenPairs){
            if (i.numToken.type === TokenType.CONST_NUM)
                continue;
            record += i.toString();
            record += ":";
            record += i.numToken.value.record;
            record += "\n";
        }
        return record;
    }
    doubleDice(){
        for (let i of this.tokenPairs){
            if (i.numToken.type === TokenType.NEED_ROLL_NUM){
                i.numToken.value.num *= 2;
            }
        }
        return this;
    }
}

function getDiceResult(inputID, outputID) {
    let inputStr = document.getElementById(inputID).value;
    let dice = new Dice(inputStr);
    const textElement = document.getElementById(outputID);
    textElement.innerText = dice.rollAndGetResult().toString();
    textElement.title = dice.getRecord();
    textElement.classList.remove('highlight');
    void textElement.offsetWidth;
    textElement.classList.add('highlight');
}

function getDiceResult2(outputID) {
    let range = Number(outputID.substring(7));
    let num = Math.floor(Math.random() * range) + 1;
    const textElement = document.getElementById(outputID);
    textElement.innerText = num.toString();
    textElement.classList.remove('highlight');
    void textElement.offsetWidth;
    textElement.classList.add('highlight');
}

function getDiceResult3(inputID, outputID) {
    let addStr = document.getElementById(inputID).value;
    let dice = new Dice('1d20');
    let addDice = addStr === '' ? new Dice('0') : new Dice(addStr);
    let advantage = document.getElementById('advantage').checked;
    let disadvantage = document.getElementById('disadvantage').checked;
    let roll3 = document.getElementById('roll3').checked;
    let hint19 = document.getElementById('hint19').checked;

    let diceResult; let diceRecord1; let diceRecord2; let diceRecord3;
    if (advantage){
        if (roll3){
            let diceResult1 = dice.rollAndGetResult();
            diceRecord1 = dice.getRecord();
            let diceResult2 = dice.rollAndGetResult();
            diceRecord2 = dice.getRecord();
            let diceResult3 = dice.rollAndGetResult();
            diceRecord3 = dice.getRecord();
            diceResult = Math.max(diceResult1, diceResult2, diceResult3);
        }
        else{
            let diceResult1 = dice.rollAndGetResult();
            diceRecord1 = dice.getRecord();
            let diceResult2 = dice.rollAndGetResult();
            diceRecord2 = dice.getRecord();
            diceResult = Math.max(diceResult1, diceResult2);
        }
    }
    else if (disadvantage){
        let diceResult1 = dice.rollAndGetResult();
        diceRecord1 = dice.getRecord();
        let diceResult2 = dice.rollAndGetResult();
        diceRecord2 = dice.getRecord();
        diceResult = Math.min(diceResult1, diceResult2);
    }
    else {
        diceResult = dice.rollAndGetResult();
        diceRecord1 = dice.getRecord();
    }
    let addDiceResult = addDice.rollAndGetResult();

    const textElement = document.getElementById(outputID);
    textElement.innerText = (diceResult + addDiceResult).toString();

    let titleStr = "";
    if (advantage){
        if (roll3){
            titleStr += diceRecord1;
            titleStr += diceRecord2;
            titleStr += diceRecord3;
        }
        else{
            titleStr += diceRecord1;
            titleStr += diceRecord2;
        }
    }
    else if (disadvantage){
        titleStr += diceRecord1;
        titleStr += diceRecord2;
    }
    else {
        titleStr += diceRecord1;
    }
    titleStr += '加值：\n' + addDice.getRecord();
    textElement.title = titleStr;

    if(diceResult===20){
        textElement.style.borderColor = 'red';
        textElement.style.borderWidth = '5px';
        document.getElementById("hint-checked").checked = true;
        document.getElementById("hint-text").style.color = "red";
    }
    else if(diceResult===19 && hint19){
        textElement.style.borderColor = 'red';
        textElement.style.borderWidth = '5px';
        document.getElementById("hint-checked").checked = true;
        document.getElementById("hint-text").style.color = "red";
    }
    else if (diceResult === 1){
        textElement.style.borderColor = 'black';
        textElement.style.borderWidth = '5px';
        document.getElementById("hint-checked").checked = false;
        document.getElementById("hint-text").style.color = "#9e9e9e"
    }
    else{
        textElement.style.borderColor = '#2bbbad';
        textElement.style.borderWidth = '2px';
        document.getElementById("hint-checked").checked = false;
        document.getElementById("hint-text").style.color = "#9e9e9e"
    }


    textElement.classList.remove('highlight');
    void textElement.offsetWidth;
    textElement.classList.add('highlight');
}

function getDiceResult4(){
    const textElement = document.getElementById("result-damage");
    const detailElement = document.getElementById("result-detail");
    const damageItems = document.getElementById("damage-items");
    detailElement.innerText = "";
    let hint = document.getElementById("hint-checked").checked;
    let sum = 0;

    for (let i of damageItems.querySelectorAll(".damage-item")){
        if (!i.querySelector(".dice-enable").checked) continue;
        let damageType = i.querySelector(".damage-type-selector").value;
        let damageResistance = i.querySelector(".damage-resistance").value;
        let damageDice = i.querySelector(".dice-str").value;
        let damageNote = i.querySelector(".dice-note").value;

        let dice = new Dice(damageDice);
        if (hint) dice = dice.doubleDice();
        dice.roll();

        let result = Math.floor(Number(damageResistance) * dice.getResult());
        sum += result;

        if (damageNote !== "")
            detailElement.innerText += `${damageType}(${damageNote}): ${result}\t倍率：${damageResistance}\n`;
        else
            detailElement.innerText += `${damageType}: ${result}\t倍率：${damageResistance}\n`;

        let recordStr = dice.getRecord2().replace(/\n/g,"\n\t").trimEnd();
        detailElement.innerText += `\t${recordStr}\n`;
    }

    textElement.innerText = sum.toString();
    textElement.classList.remove('highlight');
    void textElement.offsetWidth;
    textElement.classList.add('highlight');
}