"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const babel = require('@babel/core');
const pluginTransformModulesCommonJs = require('@babel/plugin-transform-modules-commonjs');
function compile(filename, source) {
    return babel.transform(source, {
        filename,
        configFile: false,
        babelrc: false,
        highlightCode: false,
        compact: false,
        sourceType: 'module',
        sourceMaps: true,
        parserOpts: {
            plugins: [
                'asyncGenerators',
                'classProperties',
                'classPrivateProperties',
                'classPrivateMethods',
                'optionalCatchBinding',
                'objectRestSpread',
                'numericSeparator',
                'dynamicImport',
                'importMeta',
            ],
        },
        plugins: [pluginTransformModulesCommonJs],
    });
}
exports.compile = compile;
