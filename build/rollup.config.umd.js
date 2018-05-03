import config from './rollup.config';
import buble  from 'rollup-plugin-buble';

config.format     = 'umd';
config.dest       = 'dist/rbtree.js';
config.moduleName = 'RBTree';
config.plugins    = [ buble() ];

export default config;
