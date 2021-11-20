# Quiz Hero

## What?

Quiz Hero is a web component used to have website visitor answer a series of questions. It is meant to be a 'screener' questionnaire to qualify or disqualify prospective customers or leads. It aims to be useful for companies that sell products and services that are complex/specialized.

## Installation

To build, run:

    npm install
    npm run build

After the above two commands you will find a `quiz-hero.js`. This file can be loaded in HTML using as a ES6 module with a script tag:

    <script type="module" src="quiz-hero.js"></script>

## Usage

    <quiz-hero>
      <span slot="title">
        Quiz Title Here
      </span>

      <span slot="success">
        <div><h3>Success message</h3></div>
        <div>
          <p>Place a call-to-action like a phone number of download link here.</p>
        </div>
      </span>

      <span slot="failure">
        <div>
          <h3>Failure Message</h3>
        </div>
        <div>
          <p>Tell people why they are not a good fit for your product/service here, maybe refer them to a more suitable business.</p>
        </div>
      </span>
    </quiz-hero>

    <script type="module">
      const questions = [
      {
        questionId: "question1",
        text: "This is a simple yes/no question",
        description: "This is a simple question. Each question can also have an optional description, like this. You can provide more details here, if the question is complicated. ",
        answers: [
          { text: "Yes", value: "yes" , next: "question2" },
          { text: "No" , value: "no"  , next: "question2" },
        ],
        first: true,
      },
      {
        questionId: "question2",
        text: "A question with custom answers",
        description: "This is another question. Notice that the answers can have any text you'd like. Also, note that the 'next' value (shown in the source below) are both the same, so both buttons lead to the same question. However, you can open devtools and see that specific answers given are recorded.",
        answers: [
          { text: "Left" , value: "left" , next: "question3" },
          { text: "Middle" , value: "left" , next: "question3" },
          { text: "Right" , value: "right" , next: "question3" },
        ],
      },
      // ... see more in demo.html
    ];

    // grab quiz-hero component and assign the questions
    const qh = document.querySelector('quiz-hero');
    qh.questions = questions;
    </script>

### Questions Specification

Each question of the `questions` array above has the format:
    
    {
      questionId: "question1",
      text: "Text of question",
      description: "Details here.",
      answers: [
        { text: "Left" , value: "left" , next: "question2" },
        { text: "Middle" , value: "left" , next: "question2" },
        { text: "Right" , value: "right" , next: "question2" },
      ],
    }

* `questionId` is a unique identifier. It is referenced in the `answers` arrays.
* `text` is the text of the question, styled as a header.
* `description` is optional text displayed below the text. Use it to clarify the question or provide more details
* `answers` is an array of objects specifying the answers to display for the answer, with the following keys:
  * `text` - The text to display on the buttons.
  * `value` - Answer to be recorded in the answers map, available through the event listeners (see Events below).
  * `next` - The identifier of the next question. If `true`, the next card will be the `success` card given in a slot.  If `false`, the next card will be the `failure` card given in a slot.

### Styling

Quiz Hero exposes 3 CSS variables for customization: 

* `--primary-font` used as the `font-family`.
* `--primary-color`
* `--light-color`

Example:

    quiz-hero {
      --primary-font: 'Lato', sans-serif;
      --primary-color: #006c70;
      --light-color: #6C718B;
    }

### Events

The component emits three types of events:

1. `quiz-hero-item-answered` when any answer is clicked.
2. `quiz-hero-succeeded` when the quiz reaches the success screen.
3. `quiz-hero-failed` when the quiz reaches the failure screen.

The last two may be useful for creating Google Analytics events.  The "detail" key of the event object contains a Map of questions and answers given.

    qh.addEventListener('quiz-hero-item-answered', ({detail}) => {
      console.log("Current Answers: ", detail.answers);
    });
    qh.addEventListener('quiz-hero-succeeded', ({detail}) => {
      // ...
    });
    qh.addEventListener('quiz-hero-failed', ({detail}) => {
      // ...
    });
