// const axios = require('axios');
import axios from 'axios';
// const readline = require('readline');
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  "Enter area code (or leave blank): ",
  "Enter zip code: ",
  "Enter mode (day/hour): ",
  "Enter start date (YYYYMMDD or YYYYMMDDHH): ",
  "Enter end date (YYYYMMDD or YYYYMMDDHH): "
];

let answers = [];

const askQuestion = (index) => {
  if (index < questions.length) {
    rl.question(questions[index], (answer) => {
    //   console.log(`Received answer for question ${index + 1}: ${answer}`); // 追加: デバッグ用ログ
      answers.push(answer);
      askQuestion(index + 1);
    });
  } else {
    const [area, zip, mode, from, to] = answers;
    // console.log(`All answers received: ${JSON.stringify(answers)}`); // 追加: デバッグ用ログ

    const baseURL = 'https://stg-analytics-api.umembers.usen.com/weather';
    const params = {
      area: area || '',
      zip: zip,
      mode: mode,
      from: from,
      to: to
    };
    const headers = {
      'Authorization': 'JadUq72pR44wlPDXJAsjq4b55L8AGinE8i9lwIeg',
      'x-api-key': 'your_api_key_here' // ここにあなたのAPIキーを入力してください
    };

    console.log(`Sending request with params: ${JSON.stringify(params)}`); // 追加: デバッグ用ログ
    axios.get(baseURL, { params, headers })
      .then(response => {
        console.log('Response received:', response.data.data); // 追加: デバッグ用ログ
      })
      .catch(error => {
        console.error('Error fetching the data:', error); // 追加: デバッグ用ログ
      })
      .finally(() => {
        rl.close();
        console.log('Readline interface closed'); // 追加: デバッグ用ログ
      });
  }
};

askQuestion(0);
