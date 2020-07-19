let ws;
let pushStream;

const REGION = 'westeurope';
const KEY = process.env.CS_KEY;

const onClientMsg = (msg) => {
  pushStream.write(msg);
};

const initRecognitionEngine = () => {
  const sdk = require('microsoft-cognitiveservices-speech-sdk');
  const { samplesPerSecond, bitsPerSample, channels } = {
    samplesPerSecond: 44100,
    bitsPerSample: 16000,
    channels: 1,
  };
  const streamFormat = sdk.AudioStreamFormat.getWaveFormatPCM(
    samplesPerSecond,
    bitsPerSample,
    channels
  );
  pushStream = sdk.AudioInputStream.createPushStream(streamFormat);
  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
  const subscription = sdk.SpeechConfig.fromSubscription(KEY, REGION);
  const recognizer = new sdk.SpeechRecognizer(subscription, audioConfig);
  recognizer.speechRecognitionLanguage = 'en-GB';
  recognizer.sessionStarted = () => {
    console.log('Speech reco session started');
  };
  recognizer.speechStartDetected = () => {
    console.log('Speech start detected');
  };
  recognizer.speechEndDetected = () => {
    console.log('End of speech detected.');
  };
  recognizer.canceled = (o, e) => {
    try {
      console.log('canceled', e, o);
    } catch (error) {
      console.log('canceled error', error);
    }
  };
  recognizer.recognizing = (_, { result }) => {
    console.log('recognizing', result.text);
  };
  recognizer.recognized = (_, { result }) => {
    console.log('recognized: ', result.text);
    ws.send(result.text);
  };
  try {
    recognizer.startContinuousRecognitionAsync(
      2,
      () => {
        console.log('Recognizer start callback');
      },
      (e) => {
        console.error('Recognizer error callback', e);
      }
    );
  } catch (e) {
    console.log('Error starting recognizer', e);
  }
};

const startSocketServer = (onMsg) => {
  const WebSocket = require('ws');
  const PORT = process.env.SERVER_PORT || 8080;

  ws = new WebSocket.Server({ port: PORT });

  ws.on('listening', () => {
    console.info('Listening for messages on port', PORT);
  });

  ws.on('connection', (ws) => {
    console.info('New client connection');
    ws.send('Connection acknowledged - welcome to socky!');
    ws.on('message', onMsg);
  });
};

initRecognitionEngine();
startSocketServer(onClientMsg);
