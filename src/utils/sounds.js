import clickSfx from '../assets/selectSound.mp3';

export const playClick = () => {
    const audio = new Audio(clickSfx);
    audio.volume = .5;
    audio.play();
}