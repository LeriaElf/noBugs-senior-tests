import RandExp from "randexp";

const twoWordsWithDigit = new RandExp(
  /[a-z]{1,3}[0-9]{1,2}[a-z]{0,2} [a-z]{2,5}/,
);
const singleWord = new RandExp(/[a-z]{2,6}/);

export function generateInvalidName() {
  return Math.random() < 0.5 ? twoWordsWithDigit.gen() : singleWord.gen();
}
