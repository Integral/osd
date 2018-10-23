import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import uglify from 'rollup-plugin-uglify-es'
import copy from 'rollup-plugin-copy'
import serve from 'rollup-plugin-serve'

let config = [
  {
    input: 'src/osd.js',
    output: {
      name: 'dds',
      file: './dist/osd.umd.js',
      format: 'umd'
    },
    external: [],
    plugins: [
      resolve({browser: true}),
      commonjs(),
      json(),
      copy({
        'src/index.html': 'dist/index.html',
        'data/data.json': 'dist/data/data.json',
        'fonts/NewPolivanova.ttf': 'dist/styles/NewPolivanova.ttf',
        'src/osd.css': 'dist/styles/osd.css',
        'node_modules/handsontable/dist/handsontable.full.min.css': 'dist/styles/handsontable.full.min.css',
        'node_modules/milligram/dist/milligram.min.css': 'dist/styles/milligram.min.css',
        'node_modules/normalize.css/normalize.css': 'dist/styles/normalize.css',
        'node_modules/virtual-keyboard/dist/css/keyboard.min.css': 'dist/styles/keyboard.min.css',
        'node_modules/virtual-keyboard/dist/css/keyboard-basic.min.css': 'dist/styles/keyboard-basic.min.css'
      })
    ]
  },
  {
    input: 'src/osd.js',
    external: [],
    plugins: [json()],
    output: [
      { file: './dist/osd.cjs.js', format: 'cjs' },
      { file: './dist/osd.esm.js', format: 'es' }
    ]
  }
]

const isProduction = process.env.BUILD === 'production'
if (isProduction) {
  config[0].plugins.push(uglify())
  config[1].plugins.push(uglify())
} else {
  config[0].output.sourcemap = 'inline'
  config[0].plugins.push(
    serve({
      open: true,
      contentBase: ['dist'],
      port: 4000
    })
  )
}

export default config
