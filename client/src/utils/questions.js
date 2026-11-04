import bank from "../data/questions.json";

export const CATEGORIES = bank.categories;
export const ALL_QUESTIONS = bank.questions;

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
);
