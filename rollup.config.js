import typescript from 'rollup-plugin-typescript';
import resolve    from 'rollup-plugin-node-resolve';
import pkg        from './package.json';

const name = 'RBTree';
const sourcemap = true;

export default {
  input: './index.ts',
  output: [{
    file: pkg.main,
    format: 'umd',
    exports: 'named',
    name, sourcemap
  }],
  plugins: [
    resolve(),
    typescript({
      typescript: require('typescript')
    })
  ]
};
