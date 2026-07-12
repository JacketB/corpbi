module.exports = {
  input: ['src/app'],
  output: 'public/assets/i18n',
  langs: ['ru', 'en'],
  addMissingKeys: true,
  unflat: true,
  defaultValue: '{{key}}',
  usePrettier: true
};