//遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardMatchFailed: "CardMatchFailed",
  CardMatched: "CardMatched",
  GameFinished: "GameFinished",
}

//宣告花色
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardElement(index){
    return `<div data-index="${index}" class="card back"></div>`
  },
  
   getCardContent(index){
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src="${symbol}" alt="symbol">
        <p>${number}</p>`
  },

  transformNumber(number){
    switch(number){
      case 1:  
        return 'A'
      case 11:
        return 'J'  
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  //翻牌
  //flipCards(1, 2, 3, 4, 5) 可帶入多個參數
  //cards = [1, 2, 3, 4, 5]
  flipCards(...cards) {  //其餘參數rest parameters
    cards.map(card => {
      if(card.classList.contains('back')) {
      //執行卡片正面:數字+花色
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index)) //把getCardContent加進去getCardElement 
      return //結束此函示
      }
      //執行卡片背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  displayCards(indexes){
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index =>this.getCardElement(index)).join('')
  },

  pairCards(...cards) {
    cards.map(card => {
          card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationed', event => event.target.classList.remove('wrong'), {once:true}) //跑完動畫class就移除wrong
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const model = {
  revealedCards: [],

  isRevealedCardMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0,
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumArray(52))
  },
  
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return //如果不是卡片背面，則停止函式
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes) //(model.triedTimes++)會少算一次
        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷是否配對成功
        if (model.isRevealedCardMatched()) {
          //true值:配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          //分數=260
          if(model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits

        } else {
          //false值:配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }

}

const utility = {
  getRandomNumArray(count) {
    const number = Array.from(Array(count).keys()) //number = [0, 1, ..., 51]
    for(let index = number.length - 1; index > 0; index--){
      let randomIndex = Math.floor(Math.random() * (index + 1)) //隨機0-51
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number //index位置已完成變換
  }
}

controller.generateCards() //取代view.displayCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})
// 箭頭函示
// forEach(function(card){
//   card.addEventListener('click',function(event){
//   }
// })