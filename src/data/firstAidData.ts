import rawData from './firstaid.json';
import { QuizQuestion } from '../components/QuizScreen';

console.log('rawData length:', rawData.length); // ← ye add karo

export const firstAidQuestions: QuizQuestion[] = rawData.map((item, idx) => ({
  id: `fa_${idx}`,
  question: item.question,
  options: item.options,
  correctIndex: item.options.indexOf(item.correctAnswer),
  chapterTitle: 'First Aid',
}));

console.log('firstAidQuestions length:', firstAidQuestions.length); // ← ye bhi