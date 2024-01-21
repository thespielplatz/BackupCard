# Backup Card Creator

[![MIT License Badge](docs/img/license-badge.svg)](LICENSE)

Creates from a mnemonic (BIP39) printable sheets for:
- backup card of the mnemonic for lamination
- cover sheet for the backup card 
- the zpub with QR code for account 0 `m/84'/0'/0'`
- Sheet with 8 addresses (and a button to produce more)

For a single page offline version either run `npm run build` or download the latest 
`backup-card-offline.html` from the [releases](https://github.com/thespielplatz/BackupCard/releases).

The idea is to use this in a safe environment: e.g. 
- small linux loaded in RAM without hdd or pendrive, so no data is persisted see [Freezer](freezer/README.md)
- computer without hdd and network hardware
- USB Printer without network capabilities
  - ... and please research, if the printer save the last printouts
  - ... and please research, if "some time" power is enough to clear the printers memory
- To produce a mnemonic seed in a secure environment you could use [Mnemonic Offline Tool](https://github.com/bitaps-com/mnemonic-offline-tool)
or [Iancoleman BIP39](https://github.com/iancoleman/bip39/blob/master/readme.md#standalone-offline-version).

### Print sizes
- Backup Card Sheet: `70mm` x `95mm`
- Size inside of Cover sheet: `80mm` x `105mm`

### Backlog

- [ ] Add vue project for generation (development get easier)
- [ ] Add unit tests for wallet & address generation
- [ ] Add option for seed split
- [ ] Refactor 2 two "projects": Add BIP32 encrypt. Page 2 encrypted Text
- [ ] BIP32 decrypt script (example)
- [ ] Add Optional Passphrase

#### Done Next Release

#### Done V1.2
- [x] Add Wallet name on account0 page and address pages
- [x] Add Account generation

#### Done V1.1
- [x] Page 1: SeedWords with foldable back (quasi "Recovery Words" und "Restore" von BitBox02 Back card template) fürs laminieren
- [x] Page 2: Foldable thingy like BitBox02 Backup Card, just that cutted and laminated Page 1 fits into this
- [x] Page 3: Acount 0 XPUB with QR Code and Joe Text
- [x] Page 4 till X: Addresses incl. QR Code
- [x] Backup Name on Envelope
- [x] Loading indicater when stuff is calculated
- [x] Add dynamic Backname Input field
- [x] Some build one file

#### Ideas
- Toggle for either Mnemonic, BIP32 ZPRV or account0 ZPRV

###  Docs & Hints

If you have a file:// cors problem --> use 
```bash
npm run dev
# Needs http-server installed
# or
python3 -m http.server 8000
# or
python -m http.server 8000
```

#### Dev Notes

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
