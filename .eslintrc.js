module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    env: {
        browser: true,
        node: true
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'prettier',
        'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
        'prettier/@typescript-eslint',  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    ],
    rules: {
        '@typescript-eslint/camelcase': 0,
        '@typescript-eslint/no-empty-function': 0,
        "@typescript-eslint/ban-ts-ignore":0
    }
};
