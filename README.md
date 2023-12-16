### Print sizes
- Seed Sheet: 70mm x 95mm
- Seed Sheet Laminated: 80mm x 105mm

### Todos

- [x] Page 1: SeedWords with foldable back (quasi "Recovery Words" und "Restore" von BitBox02 Back card template) fürs laminieren
- [x] Page 2: Foldable thingy like BitBox02 Backup Card, just that cutted and laminated Page 1 fits into this
- [x] Page 3: Acount 0 XPUB with QR Code and Joe Text
- [x] Page 4 till X: Addresses incl. QR Code
- [x] Backup Name on Envelope
- [ ] Loading indicater when stuff is calculated
- [ ] Some build one file
- [ ] Add dynamic Backname Input field
- [ ] Toggle for either Seed or Account


###  Docs
If you have a file:// cors problem --> use e.g. python as webserver
```bash
python3 -m http.server 8000
# or
python -m http.server 8000
```


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
