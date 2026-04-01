import * as tf from "@tensorflow/tfjs";

let model;

export async function loadModel() {
  model = tf.sequential();
  model.add(tf.layers.dense({ units: 8, inputShape: [2], activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({
    optimizer: "adam",
    loss: "binaryCrossentropy"
  });
}

export function predictAnomaly(txCount, ledger) {
  if (!model) return 0;

  const input = tf.tensor2d([[txCount, ledger]]);
  const output = model.predict(input);

  return output.dataSync()[0];
}
