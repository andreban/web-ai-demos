import { MESSAGE_CODE, MODEL_STATUS } from './consts.js';
import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';
import { MODEL_URL, MEDIAPIPE_WASM, MESSAGE_CODE } from './consts.js';

displayModelStatus(MODEL_STATUS.NOT_STARTED);

(async function () {
  displayModelStatus(MODEL_STATUS.PREPARING);
  document.getElementById('inferenceButton').disabled = true;
  try {
    const genai = await FilesetResolver.forGenAiTasks(MEDIAPIPE_WASM);
    llmInference = await LlmInference.createFromModelPath(genai, MODEL_URL);
    displayModelStatus(MODEL_STATUS.READY);
    document.getElementById('inferenceButton').disabled = false;
  } catch (error) {
    console.error('[Worker] Error preparing model:', error);
    displayModelStatus(MODEL_STATUS.ERROR);
    document.getElementById('inferenceButton').disabled = true;
  }
})();

function displayModelStatus(status) {
  document.getElementById('modelStatus').className = status;
}

function runLLMInference() {
  const userPrompt = document.getElementById('userPrompt').value;
  if (!llmInference) {
    // Just in case. This condition shouldn't normally be hit because the inference UI button is disabled until the model is ready
    throw new Error("Can't run inference, the model is not ready yet");
  }
  displayModelStatus(MODEL_STATUS.GENERATING);
  document.getElementById('inferenceButton').disabled = true;

  (async function () {
    // TODO handle errors (e.g. an inference error can happen when the input is too long). A simple try/catch isn't sufficient, we also need to terminate the previous/failing inference which I didn't figure out how to do
    const response = await llmInference.generateResponse(userPrompt);
    displayModelStatus(MODEL_STATUS.READY);
    document.getElementById('inferenceButton').disabled = false;
    document.getElementById('llmOutput').innerText = response;
  })();
}

window.runLLMInference = runLLMInference;
