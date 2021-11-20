import { html, define, property, dispatch } from './node_modules/hybrids/src/index.js';

// Or, if you want to use without npm, load from url:
// import { html, define, property, dispatch } from 'https://unpkg.com/hybrids@^6'; 

export default function QuizHero(_questions) {
  const questions = [..._questions];

  // append (functionally) an answer to a stack, making sure question/answer is valid
  function pushAnswer(answerStack, questionId, answerId) {
    // console.debug(answerStack, questionId, answerId);
    const q = lookupQuestion(questionId);
    if (q) {
      const a = q.answers.find(a => a.value === answerId);
      if (a) {
        // it was a valid answer
        return [{ questionId, answerId }, ...answerStack];
      }
      else {
        throw new Error(`can't find answer ${answerId} for ${questionId}`);
      }
    }
    else {
      throw new Error(`can't find question ${questionId}`);
    }
  }

  // pop answer from stack
  function popAnswer(answerStack) {
    const [head, ...rest] = answerStack;
    return rest;
  }

  // given the answerStack, calculate the question that should be asked 
  // returns:
  // { type: "question", question: { ... } }
  // { type: "success" }
  // { type: "failure" }
  function currentQuestion (answerStack) {
    if (answerStack.length === 0) {
      if (questions.length === 0){
        throw new Error("No questions");
      }
      return {type: "question", question: questions[0]};
    }
    else {
      const { questionId, answerId } = answerStack[0];
      const q = lookupQuestion(questionId);
      if (q) {
        const a = q.answers.find(a => a.value === answerId);
        if (a) {
          let { next } = a;
          if (typeof next === "function"){
            next = next((questionId, answerId) => lookupAnswer(answerStack, questionId, answerId), questionId);
          }

          if (next === undefined) {
            throw new Error(`undefined 'next'`);
          }
          else if (typeof next === "string"){
            return { type: "question", question: lookupQuestion(next) };
          }
          else if (typeof next === "boolean"){
            return { type: (next ? "success" : "failure") };
          }
          else {
            throw new Error(`don't understand next value ${next}`);
          }
        }
        else {
          throw new Error(`can't find answer ${answerId} for ${questionId}`);
        }
      }
      else {
        throw new Error(`can't find question ${questionId}`);
      }
    }
  }

  // private
  function lookupQuestion (questionId) {
    return questions.find(q => q.questionId === questionId);
  }

  // private
  function lookupAnswer (answerStack, questionId, answerId) {
    // console.debug("[[[lookupAnswer", answerStack, questionId, answerId, "]]]");
    const q = lookupQuestion(questionId);
    if (q) {
      const possibleAnswers = q.answers.map(a => a.value);
      if (possibleAnswers.findIndex(a => a === answerId) >= 0) {
        const qa = answerStack.find(pair => pair.questionId === questionId);
        return qa.answerId === answerId;
      }
      else {
        throw new Error(`"${answerId} is not a valid answer to question "${questionId}". (q = ${JSON.stringify(q)}, possible answers = ${possibleAnswers})`); 
      }
    }
    else {
      throw new Error(`new such question "${questionId}"`);
    }
  }

  return  {
    pushAnswer,
    currentQuestion, 
    popAnswer, 
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Web component 

function back(host) {
  host.answerStack = host.quizHero.popAnswer(host.answerStack);
}

function emit(host, eventName) {
  dispatch( host, eventName, { 
      detail: { 
        answers: new Map(host.answerStack.map(({questionId, answerId}) => [questionId, answerId])),
      }
    }
  );
}

function renderBackButton(host) {
  return html`
  <div class="back-button-row">
    <a onclick="${back}" class="back-button">&lt; Back</a>
  </div>
  `;
}

function renderQuestionCard (host, question) {
  const { questionId, text, description, first, answers } = question;

  const handleAnswer = answerId => host => {
    host.answerStack = host.quizHero.pushAnswer(host.answerStack, questionId, answerId);
  };
  emit(host, "quiz-hero-item-answered");

  return html`

    <div class="card-body">
      <div class="question-header">
        ${text}
      </div>

      ${description && html`
      <div class="question-body"> ${description} </div>
      `}
      <div class="answer-row">
        ${answers.map(({text, value}) => html`
        <button innerHTML="${text}" class="answer-button" onclick="${handleAnswer(value)}">
        </button>
        `)}
      </div>

      ${first ? '' :  renderBackButton()}
    </div>
  `;
}

function renderSuccessCard (host) {
  return html`
    <div class="card-body"> 
      <slot name="success">
        <h2>
          Default sucess message
        </h2>
        <div>
          <p>Place your failure message in slot "success"</p>
        </div>
      </slot>
      ${renderBackButton()}
    </div> 
  `;
}

function renderFailureCard (host) {
  return html`
    <div class="card-body"> 
      <slot name="failure">
        <h2>
          Default failure message
        </h2>
        <div>
          <p>Place your failure message in slot "failure"</p>
        </div>
      </slot>
      ${renderBackButton()}
    </div> 
  `;
}

function renderCard (host) {
  const data = host.quizHero.currentQuestion(host.answerStack);
  if (data.type === "question") {
    return renderQuestionCard(host, data.question);
  }
  else if (data.type === "failure"){ 
    emit(host, 'quiz-hero-failed');
    return renderFailureCard(host);
  }
  else if (data.type === "success"){ 
    emit(host, 'quiz-hero-succeeded');
    return renderSuccessCard(host);
  }
}

// styles {{{
function renderStyle(host) {
  return html`
<style>

:host { 
  display: block;
  --primary-font: sans-serif;
  --primary-color: #006c70;
  --light-color: #6C718B;
}

.card {
  border-radius: 0 0 calc(.4rem - 1px) calc(.4rem - 1px) ;
  box-shadow: 0 14px 25px 1px rgba(41,49,89,0.3);
  background-color: white;
}

.card * {
  text-align: center;
  font-family: var(--primary-font);
}

.card-header {
  border-radius: calc(.4rem - 1px) calc(.4rem - 1px) 0 0 ;
  font-size: 1.5rem;
  font-weight: 500;
  color: white;
  background-color: var(--primary-color);
  text-align: center;
  padding: 1% 2%;
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4% 6%;
}

.question-header {
  font-size: 1.5rem;
  font-weight: 500;
  padding: 0 0 2% 0;
  text-align: center;
}

.question-body {
  color: var(--light-color);
  font-size: 1.25rem;
  font-weight: 300;
  padding: 0 0 2% 0;
  text-align: center;
}

slot[name="failure"] {
}

.answer-row {
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: row;
  flex-wrap: wrap;
}

.answer-button {
  border: 1px solid transparent;
  border-color: var(--primary-color);
  border-radius: .4rem;
  min-width: 150px;
  min-height: 150px;
  font-size: 1.25rem;
  font-weight: 500;
  margin: 10px;

  background-color: white;
  color: var(--primary-color);
}

.answer-button:hover {
  color: white;
  background-color: var(--primary-color);
}

.back-button-row {
  padding-top: 2%;
}

.back-button {
  color: var(--primary-color);
  font-size: 1.4rem;
  text-decoration: none;
}
</style>
  `;
}
// }}}

function render(host) {
  return html`
    ${renderStyle(host)}
    <div class="card">
      <div class="card-header">
        <slot name="title">
        Your quiz title here
        </slot>
      </div>

      ${host.quizHero.pushAnswer !== undefined ?  renderCard(host) : ''}
    </div>
  `;
}

define({
  tag: "quiz-hero",

  answerStack: [],
  questions: property( 
    [], 
    // don't need a connect function that runs once when constructed
    undefined,  
    // the observer function runs every assignment.
    (host) => { host.quizHero = QuizHero(host.questions); },
  ),
  quizHero: property({}), 
  render: render,
});

