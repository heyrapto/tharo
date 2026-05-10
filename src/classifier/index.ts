import natural from "natural";
import type { ClassificationResult } from "../@types/index.js";

/**
 * Intent Classifier to handle lexical variability.
 * This bridges the gap between what the user said and what they really mean.
 */
export class IntentClassifier {
  private classifier: natural.BayesClassifier;

  constructor() {
    this.classifier = new natural.BayesClassifier();
  }

  /**
   * Trains the classifier with a dataset of varied lexical inputs mapped to intents.
   */
  train(data: Array<{ text: string; label: string }>) {
    data.forEach((item) => {
      this.classifier.addDocument(item.text, item.label);
    });
    this.classifier.train();
  }

  /**
   * Classifies an input text into the most probable intent label.
   */
  classify(text: string): string {
    return this.classifier.classify(text);
  }

  /**
   * Returns a scored list of all possible classifications for the input.
   */
  getClassifications(text: string): ClassificationResult[] {
    return this.classifier.getClassifications(text);
  }
}

export const Classifier = new IntentClassifier();
