
import { Exam } from './types';

// This data is now used to initialize localStorage if it's empty.
// All runtime exam data is managed by mockApi.ts
export const INITIAL_EXAMS: Exam[] = [
  {
    name: 'General Knowledge Championship',
    durationInMinutes: 30,
    supportedLanguages: ['en', 'hi'],
    questions: [
      { id: 1, text: { en: "What is the capital of France?", hi: "फ्रांस की राजधानी क्या है?" }, options: [{ en: "Berlin", hi: "बर्लिन" }, { en: "Madrid", hi: "मैड्रिड" }, { en: "Paris", hi: "पेरिस" }, { en: "Rome", hi: "रोम" }], correctAnswerIndex: 2 },
      { id: 2, text: { en: "Which planet is known as the Red Planet?", hi: "किस ग्रह को लाल ग्रह के नाम से जाना जाता है?" }, options: [{ en: "Earth", hi: "पृथ्वी" }, { en: "Mars", hi: "मंगल" }, { en: "Jupiter", hi: "बृहस्पति" }, { en: "Venus", hi: "शुक्र" }], correctAnswerIndex: 1 },
      { id: 3, text: { en: "What is the largest ocean on Earth?", hi: "पृथ्वी पर सबसे बड़ा महासागर कौन सा है?" }, options: [{ en: "Atlantic", hi: "अटलांटिक" }, { en: "Indian", hi: "हिंद महासागर" }, { en: "Arctic", hi: "आर्कटिक" }, { en: "Pacific", hi: "प्रशांत" }], correctAnswerIndex: 3 },
      { id: 4, text: { en: "Who wrote 'To Kill a Mockingbird'?", hi: "'टू किल ए मॉकिंगबर्ड' किसने लिखा?" }, options: [{ en: "Harper Lee", hi: "हार्पर ली" }, { en: "Mark Twain", hi: "मार्क ट्वेन" }, { en: "F. Scott Fitzgerald", hi: "एफ. स्कॉट फिट्जगेराल्ड" }, { en: "Ernest Hemingway", hi: "अर्नेस्ट हेमिंग्वे" }], correctAnswerIndex: 0 },
      { id: 5, text: { en: "What is the chemical symbol for gold?", hi: "सोने का रासायनिक प्रतीक क्या है?" }, options: [{ en: "Ag", hi: "Ag" }, { en: "Au", hi: "Au" }, { en: "Pb", hi: "Pb" }, { en: "Fe", hi: "Fe" }], correctAnswerIndex: 1 },
      { id: 6, text: { en: "In which year did the Titanic sink?", hi: "टाइटैनिक किस वर्ष में डूबा?" }, options: [{ en: "1905", hi: "1905" }, { en: "1912", hi: "1912" }, { en: "1918", hi: "1918" }, { en: "1923", hi: "1923" }], correctAnswerIndex: 1 },
      { id: 7, text: { en: "What is the hardest natural substance on Earth?", hi: "पृथ्वी पर सबसे कठोर प्राकृतिक पदार्थ क्या है?" }, options: [{ en: "Gold", hi: "सोना" }, { en: "Iron", hi: "लोहा" }, { en: "Diamond", hi: "हीरा" }, { en: "Platinum", hi: "प्लैटिनम" }], correctAnswerIndex: 2 },
      { id: 8, text: { en: "Who painted the Mona Lisa?", hi: "मोना लिसा को किसने चित्रित किया?" }, options: [{ en: "Vincent van Gogh", hi: "विन्सेंट वैन गॉग" }, { en: "Pablo Picasso", hi: "पाब्लो पिकासो" }, { en: "Leonardo da Vinci", hi: "लियोनार्डो दा विंची" }, { en: "Claude Monet", hi: "क्लाउड मोनेट" }], correctAnswerIndex: 2 },
      { id: 9, text: { en: "How many continents are there?", hi: "कितने महाद्वीप हैं?" }, options: [{ en: "5", hi: "5" }, { en: "6", hi: "6" }, { en: "7", hi: "7" }, { en: "8", hi: "8" }], correctAnswerIndex: 2 },
      { id: 10, text: { en: "What is the currency of Japan?", hi: "जापान की मुद्रा क्या है?" }, options: [{ en: "Yuan", hi: "युआन" }, { en: "Won", hi: "वोन" }, { en: "Yen", hi: "येन" }, { en: "Baht", hi: "बाह्त" }], correctAnswerIndex: 2 },
    ],
    startTime: null,
    endTime: null,
  },
  {
    name: 'Basic Computer Literacy Test',
    durationInMinutes: 20,
    supportedLanguages: ['en'],
    questions: [
      { id: 1, text: { en: "What does CPU stand for?" }, options: [{ en: "Central Processing Unit" }, { en: "Computer Personal Unit" }, { en: "Central Program Unit" }, { en: "Control Process Unit" }], correctAnswerIndex: 0 },
      { id: 2, text: { en: "Which of the following is a volatile memory?" }, options: [{ en: "ROM" }, { en: "HDD" }, { en: "SSD" }, { en: "RAM" }], correctAnswerIndex: 3 },
      { id: 3, text: { en: "What is the full form of LAN?" }, options: [{ en: "Local Area Network" }, { en: "Large Area Network" }, { en: "Local Array Node" }, { en: "Large Array Node" }], correctAnswerIndex: 0 },
      { id: 4, text: { en: "Who is known as the father of computers?" }, options: [{ en: "Charles Babbage" }, { en: "Alan Turing" }, { en: "Tim Berners-Lee" }, { en: "Bill Gates" }], correctAnswerIndex: 0 },
      { id: 5, text: { en: "What does 'HTTP' stand for?" }, options: [{ en: "HyperText Transfer Protocol" }, { en: "HighText Transfer Protocol" }, { en: "HyperText Transmission Protocol" }, { en: "HyperText Transfer Program" }], correctAnswerIndex: 0 },
    ],
    startTime: null,
    endTime: null,
  }
];
