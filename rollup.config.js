import { uglify } from "rollup-plugin-uglify";

export default {
  input: 'index.js',
  output: {
    file: 'quiz-hero.js',
    format: 'es'
  },
  plugins: [uglify()],
};


