const path = require('path');
const { override, babelInclude, addBabelPreset } = require('customize-cra');

// eslint-disable-next-line no-undef
module.exports = function (config, env) {
    return Object.assign(
        config,
        override(
            babelInclude([
                /* transpile (converting to es5) code in src/ and shared component library */
                    path.resolve('src'),
                    path.resolve('../../../common'),
                    path.resolve('./node_modules/react-to-pdf/dist/module.js'),
                    addBabelPreset('@emotion/babel-preset-css-prop'),
                ]
            )(config, env),
        ),
    );
};
