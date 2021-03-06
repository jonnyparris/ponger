<template>
  <div>
    <table width="100%">
      <tr>
        <td></td>
        <td>
          <h1 style="font-weight: 500;">
            Ponger
          </h1>
        </td>
      </tr>
      <tr>
        <td align="right">
          <a
            href="https://docs.microsoft.com/azure/cognitive-services/speech-service/get-started"
            target="_blank"
            >Subscription</a
          >:
        </td>
        <td>
          <input
            :disabled="subscriptionKeyDisabled"
            v-model="subscriptionKey"
            placeholder="subscriptionKey"
            type="text"
            size="40"
          />
        </td>
      </tr>
      <tr>
        <td align="right">Region</td>
        <td>
          <input
            v-model="serviceRegion"
            placeholder="serviceRegion"
            type="text"
            size="40"
          />
        </td>
      </tr>
      <tr>
        <td></td>
        <td>
          <button
            id="startRecognizeOnceAsyncButton"
            @click="startListening"
            :disabled="listening"
          >
            Start listening
          </button>
        </td>
      </tr>
      <tr>
        <td align="right" valign="top">Results</td>
        <td>
          <textarea
            v-model="phrase"
            style="display: inline-block; width: 500px; height: 200px;"
          ></textarea>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';

export default {
  name: 'Demo',
  setup() {
    const phrase = ref('');
    const subscriptionKey = ref('');
    const serviceRegion = ref('westeurope');
    const authorizationToken = ref(null);
    const listening = ref(false);
    const subscriptionKeyDisabled = ref(false);
    let SDK;

    const getAuthToken = async () => {
      const authorizationEndpoint =
        'https://westeurope.api.cognitive.microsoft.com/sts/v1.0/issuetoken';
      return new Promise((resolve, reject) => {
        const a = new XMLHttpRequest();
        a.open('POST', authorizationEndpoint);
        a.setRequestHeader('Content-Type', 'application/json');
        a.setRequestHeader('Ocp-Apim-Subscription-Key', subscriptionKey.value);
        a.onload = function () {
          const token = JSON.parse(atob(this.responseText.split('.')[1]));
          serviceRegion.value = token.region;
          authorizationToken.value = this.responseText;
          subscriptionKeyDisabled.value = true;
          subscriptionKey.value =
            'using authorization token (hit F5 to refresh)';
          console.log('Got an authorization token: ' + JSON.stringify(token));
          resolve();
        };
        a.send('');
      });
    };

    const startListening = async () => {
      await getAuthToken();
      listening.value = true;
      phrase.value = '';

      // if we got an authorization token, use the token. Otherwise use the provided subscription key
      let speechConfig;
      if (authorizationToken.value) {
        speechConfig = SDK.SpeechConfig.fromAuthorizationToken(
          authorizationToken.value,
          serviceRegion.value
        );
      } else {
        if (
          subscriptionKey.value === '' ||
          subscriptionKey.value === 'subscription'
        ) {
          alert(
            'Please enter your Microsoft Cognitive Services Speech subscription key!'
          );
          subscriptionKeyDisabled.value = false;
          return;
        }
        speechConfig = SDK.SpeechConfig.fromSubscription(
          subscriptionKey.value,
          serviceRegion.value
        );
      }

      speechConfig.speechRecognitionLanguage = 'en-UK';
      const audioConfig = SDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SDK.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognizeOnceAsync(
        function (result) {
          listening.value = false;
          phrase.value += result.text;
          console.log('Recognition success', result);
          recognizer.close();
        },
        function (err) {
          listening.value = false;
          phrase.value += err;
          console.error('Recognition error', err);
          recognizer.close();
        }
      );
    };

    onMounted(() => {
      SDK = window.SpeechSDK;
    });

    return {
      subscriptionKeyDisabled,
      phrase,
      subscriptionKey,
      serviceRegion,
      startListening,
      listening,
    };
  },
};
</script>
