// import sdk from 'microsoft-cognitiveservices-speech-sdk';
let ws;

const startSocketServer = () => {
  const WebSocket = require('ws');
  const PORT = proces.env.SERVER_PORT || 8080;
  ws = new WebSocket.Server({ port: PORT });

  ws.on('listening', () => {
    console.log('Listening for messages on port', PORT);
  });

  ws.on('connection', (ws) => {
    ws.on('message', (message) => {
      console.log(`Received message => ${message}`);
    });
    ws.send('Connection acknowledged - welcome to socky!');
  });
};

// const REGION = 'westeurope';
// const KEY = process.env.CS_KEY;

// function SpeechToText() {
//   const { region, samplesPerSecond, bitsPerSample, channels } = {
//     region: REGION,
//     samplesPerSecond: 44100,
//     bitsPerSample: 16000,
//     channels: 1,
//   };

//   var s = sdk.SpeechConfig.fromSubscription(KEY, REGION);

//   let p;
//   const format = sdk.AudioStreamFormat.getWaveFormatPCM(
//     samplesPerSecond,
//     bitsPerSample,
//     channels
//   );

//   this.pushStream = sdk.AudioInputStream.createPushStream(format);

//   this.recognizeAsync = function () {
//     let audioConfig = sdk.AudioConfig.fromStreamInput(this.pushStream);
//     this.recognizer = new sdk.SpeechRecognizer(s, audioConfig);
//     this.recognizer.startContinuousRecognitionAsync();
//     cognizer.canceled = (o, e) => {
//       try {
//         console.log('canceled', e, o);
//       } catch (error) {
//         console.log('canceled error', error);
//       }
//     };
//     this.recognizer.recognizing = (rec, { result }) => {
//       console.log('recognizing', result.text);
//     };
//     this.recognizer.recognized = (rec, { result }) => {
//       console.log('recognized: ', result.text);
//     };
//   };
// }

// const speectToText = new SpeechToText();
// speectToText.recognizeAsync();

// // Converts text to speech using the input from readline.
// const _speechToText = (text, config, selectedLang) => {
//   return new Promise(async (resolve, reject) =>
//     speectToText.pushStream.write(text)
//   );
// };
