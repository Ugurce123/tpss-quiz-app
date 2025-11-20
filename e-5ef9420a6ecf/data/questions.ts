
import { Question } from '@/types/quiz';

export const questions: Question[] = [
  {
    id: 1,
    question: "Türkiye'nin başkenti neresidir?",
    options: ["İstanbul", "Ankara", "İzmir", "Bursa", "Adana"],
    correctAnswer: 1,
    explanation: "Türkiye'nin başkenti Ankara'dır. 1923 yılında Cumhuriyet'in ilanından sonra başkent olmuştur.",
    category: "Coğrafya",
    difficulty: "easy",
    level: 1,
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    question: "2 + 2 kaç eder?",
    options: ["3", "4", "5", "6", "7"],
    correctAnswer: 1,
    explanation: "2 + 2 = 4'tür. Bu temel bir toplama işlemidir.",
    category: "Matematik",
    difficulty: "easy",
    level: 1
  },
  {
    id: 3,
    question: "Hangi gezegen Güneş'e en yakındır?",
    options: ["Venüs", "Mars", "Merkür", "Dünya", "Jüpiter"],
    correctAnswer: 2,
    explanation: "Merkür, Güneş'e en yakın gezegendir. Güneş'ten ortalama 58 milyon km uzaklıktadır.",
    category: "Astronomi",
    difficulty: "easy",
    level: 1,
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    question: "JavaScript hangi yılda oluşturulmuştur?",
    options: ["1993", "1995", "1997", "1999", "2001"],
    correctAnswer: 1,
    explanation: "JavaScript 1995 yılında Brendan Eich tarafından Netscape için geliştirilmiştir.",
    category: "Teknoloji",
    difficulty: "easy",
    level: 1
  },
  {
    id: 5,
    question: "Osmanlı İmparatorluğu hangi yılda kurulmuştur?",
    options: ["1299", "1453", "1571", "1683", "1789"],
    correctAnswer: 0,
    explanation: "Osmanlı İmparatorluğu 1299 yılında Osman Gazi tarafından kurulmuştur.",
    category: "Tarih",
    difficulty: "easy",
    level: 1
  },
  {
    id: 6,
    question: "Dünya'nın en büyük okyanusu hangisidir?",
    options: ["Atlantik", "Hint", "Pasifik", "Arktik", "Güney"],
    correctAnswer: 2,
    explanation: "Pasifik Okyanusu, Dünya'nın en büyük okyanusudur ve toplam yüzey alanının yaklaşık %46'sını kaplar.",
    category: "Coğrafya",
    difficulty: "easy",
    level: 2,
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop"
  },
  {
    id: 7,
    question: "5 × 8 kaç eder?",
    options: ["35", "40", "45", "50", "55"],
    correctAnswer: 1,
    explanation: "5 × 8 = 40'tır. Bu temel bir çarpma işlemidir.",
    category: "Matematik",
    difficulty: "easy",
    level: 2
  },
  {
    id: 8,
    question: "İnsan vücudunda kaç kemik vardır?",
    options: ["196", "206", "216", "226", "236"],
    correctAnswer: 1,
    explanation: "Yetişkin insan vücudunda 206 kemik bulunur. Bebekler 270 kemikle doğar, ancak büyüme sürecinde bazıları birleşir.",
    category: "Biyoloji",
    difficulty: "easy",
    level: 2
  },
  {
    id: 9,
    question: "Hangi element periyodik tabloda 'O' sembolü ile gösterilir?",
    options: ["Osmiyum", "Oksijen", "Altın", "Gümüş", "Demir"],
    correctAnswer: 1,
    explanation: "Oksijen elementi periyodik tabloda 'O' sembolü ile gösterilir ve atom numarası 8'dir.",
    category: "Kimya",
    difficulty: "easy",
    level: 2
  },
  {
    id: 10,
    question: "Mona Lisa tablosunu kim yapmıştır?",
    options: ["Michelangelo", "Leonardo da Vinci", "Picasso", "Van Gogh", "Monet"],
    correctAnswer: 1,
    explanation: "Mona Lisa, Leonardo da Vinci tarafından 1503-1519 yılları arasında yapılmış ünlü bir tablodur.",
    category: "Sanat",
    difficulty: "easy",
    level: 3,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
  }
];

// --- Admin yönetimi için kalıcı veri ---
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_QUESTIONS_KEY = 'custom_questions';
const HIDDEN_QUESTIONS_KEY = 'hidden_questions';

let customQuestionsCache: Question[] = [];
let hiddenQuestionIds: number[] = [];

export const initializeQuestionsFromStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem(CUSTOM_QUESTIONS_KEY);
    customQuestionsCache = stored ? JSON.parse(stored) : [];
    const hidden = await AsyncStorage.getItem(HIDDEN_QUESTIONS_KEY);
    hiddenQuestionIds = hidden ? JSON.parse(hidden) : [];
    // console.log(`Questions - Initialized: custom=${customQuestionsCache.length}, hidden=${hiddenQuestionIds.length}`);
  } catch (error) {
    // console.log('Questions - initialize error:', error);
    customQuestionsCache = [];
    hiddenQuestionIds = [];
  }
};

export const getAllQuestions = (): Question[] => {
  const byId = new Map<number, Question>();
  for (const q of questions) {
    if (!hiddenQuestionIds.includes(q.id)) {
      byId.set(q.id, q);
    }
  }
  for (const q of customQuestionsCache) {
    byId.set(q.id, q);
  }
  return Array.from(byId.values());
};

export const isCustomQuestion = (id: number): boolean => {
  return customQuestionsCache.some(q => q.id === id);
};

export const getQuestionsByLevel = (level: number): Question[] => {
  try {
    const combined = getAllQuestions();
    const levelQuestions = combined.filter(q => q.level === level);
    console.log(`getQuestionsByLevel - Found ${levelQuestions.length} questions for level ${level}`);
    
    if (levelQuestions.length === 0) {
      console.log(`getQuestionsByLevel - No questions found for level ${level}, returning fallback questions`);
      return combined.slice(0, Math.min(5, combined.length));
    }
    
    return levelQuestions.slice(0, 10);
  } catch (error) {
    console.log('getQuestionsByLevel - Error:', error);
    const combined = getAllQuestions();
    return combined.slice(0, Math.min(5, combined.length));
  }
};

export const getAllLevels = () => {
  try {
    console.log('getAllLevels - Generating levels (dynamic)');
    const levels: any[] = [];
    const combined = getAllQuestions();

    // En yüksek seviye değerini sorulardan dinamik olarak belirle
    const maxLevel = combined.reduce((max, q) => {
      const lvl = typeof q.level === 'number' ? q.level : 1;
      return Math.max(max, lvl);
    }, 1);

    for (let i = 1; i <= maxLevel; i++) {
      const questionsCount = getQuestionsByLevel(i).length;
      levels.push({
        id: i,
        name: `Seviye ${i}`,
        description: i <= 3 ? 'Kolay' : i <= 7 ? 'Orta' : 'Zor',
        questionsCount,
        passingScore: 70,
        isUnlocked: i === 1,
        isCompleted: false
      });
    }
    console.log(`getAllLevels - Generated ${levels.length} levels (maxLevel=${maxLevel})`);
    return levels;
  } catch (error) {
    console.log('getAllLevels - Error:', error);
    return [{
      id: 1,
      name: 'Seviye 1',
      description: 'Kolay',
      questionsCount: 5,
      passingScore: 70,
      isUnlocked: true,
      isCompleted: false
    }];
  }
};

export const getQuestionsByCategory = (category: string): Question[] => {
  try {
    return getAllQuestions().filter(q => q.category.toLowerCase() === category.toLowerCase());
  } catch (error) {
    console.log('getQuestionsByCategory - Error:', error);
    return [];
  }
};

export const getRandomQuestions = (count: number): Question[] => {
  try {
    const combined = getAllQuestions();
    const shuffled = [...combined].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.log('getRandomQuestions - Error:', error);
    const combined = getAllQuestions();
    return combined.slice(0, Math.min(count, combined.length));
  }
};

// --- CRUD yardımcıları ---
export const addQuestion = async (input: Omit<Question, 'id'>): Promise<Question> => {
  const newQuestion: Question = { ...input, id: Date.now() };
  customQuestionsCache.push(newQuestion);
  await AsyncStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(customQuestionsCache));
  return newQuestion;
};

export const updateQuestion = async (updated: Question): Promise<void> => {
  const idx = customQuestionsCache.findIndex(q => q.id === updated.id);
  if (idx >= 0) {
    customQuestionsCache[idx] = updated;
  } else {
    customQuestionsCache.push(updated);
  }
  await AsyncStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(customQuestionsCache));
};

export const deleteQuestion = async (id: number): Promise<void> => {
  customQuestionsCache = customQuestionsCache.filter(q => q.id !== id);
  await AsyncStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(customQuestionsCache));
};

export const hideQuestion = async (id: number): Promise<void> => {
  if (!hiddenQuestionIds.includes(id)) {
    hiddenQuestionIds.push(id);
    await AsyncStorage.setItem(HIDDEN_QUESTIONS_KEY, JSON.stringify(hiddenQuestionIds));
  }
};

export const unhideQuestion = async (id: number): Promise<void> => {
  hiddenQuestionIds = hiddenQuestionIds.filter(h => h !== id);
  await AsyncStorage.setItem(HIDDEN_QUESTIONS_KEY, JSON.stringify(hiddenQuestionIds));
};
