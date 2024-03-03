# Development Notes

## Build 
```bash
npm ci
npm run build
```
##  Development

If you have a file:// cors problem --> use

```bash
npm run dev
# Needs http-server installed
# or
python3 -m http.server 8000
# or
python -m http.server 8000
```

### Some libs needed some creation

```bash
# Generate bitcoinjs-lib.js
npx browserify --standalone bitcoin - -o js/bitcoinjs-lib.js <<<"module.exports = require('bitcoinjs-lib');"

# Generate libs
npx browserify -r bip39 -s bip39 > js/bip39.browser.js  
npx browserify -r bip32 -s bip32 > js/bip32.browser.js
npx browserify -r tiny-secp256k1 -s tiny-secp256k1 > js/tiny-secp256k1.browser.js
npx browserify -r bs58check -s base58 > js/base58.browser.js  
npx browserify --standalone Buffer - -o js/buffer.browser.js <<<"module.exports = require('buffer').Buffer;"
```
