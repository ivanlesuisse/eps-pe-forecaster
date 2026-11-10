/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness for compiled TypeScript modules. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
function load(file) {
  const compiledModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('module', 'exports', code)(compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const input = load('asset-input.ts');
const calc = load('calculations.ts');
test('numeric validation retains zero and rejects malformed input', () => {
  assert.equal(input.optionalNumber(0, 'quantity'), 0);
  assert.equal(input.optionalNumber('0', 'price'), 0);
  assert.equal(input.optionalNumber('', 'price'), null);
  assert.equal(input.finiteNumber('12.5', 'value'), 12.5);
  for (const bad of [null, undefined, '', ' ', true, {}, [], '2abc', Infinity, NaN]) {
    assert.throws(() => input.finiteNumber(bad, 'value'), input.InvalidAssetInput);
  }
});
test('free assets have an absolute gain but no finite percentage cost basis', () => {
  assert.equal(calc.calculateUnrealizedGain(100, 0, 2), 100);
  assert.equal(calc.calculateGainPercentage(100, 0, 2), 0);
  const result = calc.calculatePortfolioMetrics([{ value: 100, buyingPrice: 0, quantity: 2, category: 'stock', type: 'stock' }]);
  assert.equal(result.totalInvested, 0); assert.equal(result.totalGain, 100);
});
test('ordinary gains and missing basis remain unchanged', () => {
  assert.equal(calc.calculateUnrealizedGain(120, 10, 10), 20);
  assert.equal(calc.calculateGainPercentage(120, 10, 10), 20);
  assert.equal(calc.calculateUnrealizedGain(120, null, 10), 0);
});
test('IBKR failures never masquerade as an empty successful portfolio', async () => {
  const savedKey = process.env.IBKR_CONSUMER_KEY;
  const savedPem = process.env.IBKR_PRIVATE_KEY_PEM;
  process.env.IBKR_CONSUMER_KEY = 'test'; process.env.IBKR_PRIVATE_KEY_PEM = 'test';
  try {
    const compiledModule = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib/ibkr/client.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    let mode = 'failure';
    const signedFetch = async ({ url }) => {
      if (url.endsWith('/accounts')) return Response.json(mode === 'no-accounts' ? {} : [{ id: 'TEST' }]);
      if (url.endsWith('/positions')) {
        if (mode === 'failure') return new Response('Unavailable', { status: 503 });
        return Response.json(mode === 'invalid' ? { error: 'bad response' } : []);
      }
      return Response.json({});
    };
    new Function('require', 'module', 'exports', code)(() => ({ ibkrSignedFetch: signedFetch }), compiledModule, compiledModule.exports);
    for (const state of ['failure', 'invalid', 'no-accounts']) {
      mode = state;
      await assert.rejects(compiledModule.exports.fetchPortfolioBundle('test'));
    }
    mode = 'empty-positions';
    const result = await compiledModule.exports.fetchPortfolioBundle('test');
    assert.deepEqual(result.accounts[0].positions, []);
  } finally {
    if (savedKey === undefined) delete process.env.IBKR_CONSUMER_KEY; else process.env.IBKR_CONSUMER_KEY = savedKey;
    if (savedPem === undefined) delete process.env.IBKR_PRIVATE_KEY_PEM; else process.env.IBKR_PRIVATE_KEY_PEM = savedPem;
  }
});
