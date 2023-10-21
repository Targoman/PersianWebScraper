import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import progress from 'rollup-plugin-progress';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: [
    {
      format: "cjs",
      file: ".dist/index.cjs.js",
      inlineDynamicImports: true,
    }
  ],
  plugins: [
    progress(),
    builtins(),
    commonjs({
      exclude: "chalk"
    }),
    nodeResolve({
      jsnext: true,
      include: ['node_modules/**'],
      skip: ["chalk"],
      main: true,
      preferBuiltins: false
    }),
    json(),
    typescript({
      tsconfigOverride: {
        compilerOptions: { module: "ESNext" }
      }
    })
  ]
};