import clickSfx from '@/assets/selectSound.mp3';
import correctSfx from '@/assets/freesound-correct.mp3';
import questionSwooshSfx from '@/assets/freesound-question-swoosh.mp3';
import incorrectAnswerSfx from '@/assets/freesound-incorrect-answer.mp3';

export const playClickSound = () => {
  const audio = new Audio(clickSfx);
  audio.volume = 0.5;
  audio.play();
};

export const playCorrectAnswerSound = () => {
  const audio = new Audio(correctSfx);
  audio.volume = 0.5;
  audio.play();
};

export const playQuestionStartSound = () => {
  const audio = new Audio(questionSwooshSfx);
  audio.volume = 0.5;
  audio.play();
};

export const playIncorrectAnswerSound = () => {
  const audio = new Audio(incorrectAnswerSfx);
  audio.volume = 0.5;
  audio.play();
};
