/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
const config = {
  experimentalOperatorPosition: 'start',
  singleQuote: true,
  trailingComma: 'es5',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '^react$',
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '',
    // your internal JS (no styles)
    '^@/(?!.*[.](css|scss)$).*',
    '^(?!.*[.](css|scss)$)\\.{1,2}/.*',
    '',
    // Mantine & friends (JS only)
    '^@mantine/(?!.*[.](css|scss)$).*',
    '^@mantinex/(?!.*[.](css|scss)$).*',
    '^@mantine-tests/(?!.*[.](css|scss)$).*',
    '^@docs/(?!.*[.](css|scss)$).*',
    '',
    // third-party styles (incl. Mantine styles)
    '^(?!@/)(?!\\.{1,2}/).+[.](css|scss)$',
    '',
    // your local styles
    '^@/.+[.](css|scss)$',
    '^\\.{1,2}/.+[.](css|scss)$',
  ],
  overrides: [
    {
      files: '*.mdx',
      options: {
        printWidth: 70,
      },
    },
  ],
};

export default config;
