<template>
  <div>
    <h1>Ponger Node</h1>
    <textarea
      :value="messages"
      name="messages"
      cols="30"
      :rows="messages.length + 1"
    />
    <button @click.prevent="startListening">Listen</button>
    <button @click.prevent="stopListening">Stop</button>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';

export default {
  name: 'Node',
  setup() {
    let socky = null;
    const messages = ref([]);

    const convertFloat32ToInt16 = (buffer) => {
      let l = buffer.length;
      let buf = new Int16Array(l / 3);

      while (l--) {
        if (l % 3 === 0) {
          buf[l / 3] = buffer[l] * 0xffff;
        }
      }
      return buf.buffer;
    };

    const downsampleBuffer = (buffer, sampleRate, outSampleRate) => {
      if (outSampleRate == sampleRate) {
        return buffer;
      }
      if (outSampleRate > sampleRate) {
        throw 'downsampling rate show be smaller than original sample rate';
      }
      const sampleRateRatio = sampleRate / outSampleRate;
      const newLength = Math.round(buffer.length / sampleRateRatio);
      const result = new Int16Array(newLength);
      let offsetResult = 0;
      let offsetBuffer = 0;
      while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round(
          (offsetResult + 1) * sampleRateRatio
        );
        let accum = 0;
        let count = 0;
        for (
          var i = offsetBuffer;
          i < nextOffsetBuffer && i < buffer.length;
          i++
        ) {
          accum += buffer[i];
          count++;
        }
        result[offsetResult] = Math.min(1, accum / count) * 0x7fff;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
      }
      return result.buffer;
    };

    const handleMicrophoneBytes = (e) => {
      const left = e.inputBuffer.getChannelData(0);
      // var left16 = convertFloat32ToInt16(left); // old 32 to 16 function
      const left16 = downsampleBuffer(left, 44100, 16000);
      socky.send(left16);
    };

    const startListening = () => {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(
        (stream) => {
          AudioContext = window.AudioContext || window.webkitAudioContext;
          const context = new AudioContext({ latencyHint: 'interactive' });
          const processor = context.createScriptProcessor(0, 1, 1);
          processor.connect(context.destination);
          context.resume();
          const input = context.createMediaStreamSource(stream);
          input.connect(processor);
          processor.onaudioprocess = handleMicrophoneBytes;
        },
        (error) => {
          console.error('Listening error: ', JSON.stringify(error));
        }
      );
    };

    const stopListening = () => {
      location.reload();
    };

    const connectSocket = () => {
      try {
        socky = new WebSocket('ws://localhost:8080');
        socky.onopen = (e) => {
          socky.send("Hey, it's me the  ponger client!");
        };
        socky.onmessage = (ev) => {
          messages.value.push(ev.data);
        };
      } catch (e) {
        console.error('Error connecting to socky', e);
      }
    };

    onMounted(() => {
      connectSocket();
    });

    return {
      messages,
      startListening,
      stopListening,
    };
  },
};
</script>
