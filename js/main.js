const seedGrid = document.getElementById('seed-grid')
const seedFieldTemplate = document.getElementById('template-seed-field').innerHTML
const mnemonicInfo = document.getElementById('mnemonic-info')
const mnemonicInput = document.getElementById('mnemonic-input')
const acount0xpubField =document.getElementById('acount0xpub')
const acount0zpubField =document.getElementById('acount0zpub')
const zpubQRCode = new QRCode(document.getElementById('zpub-qrcode'), {
  text: '',
  width: 400,
  height: 400,
  colorDark: '#000000',
  colorLight: '#FFFFFF',
  correctLevel : QRCode.CorrectLevel.H,
})

zpubQRCode.clear()

const wordFields = []
const zeroPad = (num, places = 2) => String(num).padStart(places, '0')
for (let i = 0; i < 24; ++i) {
  const div = document.createElement('div')
  div.innerHTML = seedFieldTemplate
  seedGrid.appendChild(div)

  div.getElementsByClassName('label')[0].innerText = zeroPad(i + 1)
  wordFields.push(div.getElementsByClassName('value')[0])
}

function pubToPub(xyzpub, outputPub = 'xpub') {
  if (!['xpub', 'ypub', 'zpub'].includes(xyzpub.slice(0, 4))) {
    throw new Error('Invalid argument. Provided Public Key is neither a valid xpub, ypub nor zpub.')
  }

  let bytes = null
  if (outputPub === 'xpub') bytes = '0488b21e'
  if (outputPub === 'ypub') bytes = '049d7cb2'
  if (outputPub === 'zpub') bytes = '04b24746'
  if (bytes === null) throw new Error('Invalid argument output. Provide with xpub, ypub or zpub.')

  let data = base58.decode(xyzpub).slice(4)
  data = Buffer.concat([Buffer.from(bytes,'hex'), data])
  return base58.encode(data)
}

function prvToPrv(xyzprv,  outputPub = 'xprv') {
  if (!['xprv', 'yprv', 'zprv'].includes(xyzprv.slice(0, 4))) {
    throw new Error('Invalid argument. Provided Public Key is neither a valid xpub, ypub nor zpub.')
  }

  let bytes = null
  if (outputPub === 'xprv') bytes = '0488ade4'
  if (outputPub === 'yprv') bytes = '049d7878'
  if (outputPub === 'zprv') bytes = '04b2430c'
  if (bytes === null) throw new Error('Invalid argument output. Provide with xprv, yprv or zprv.')

  let data = base58.decode(xyzprv).slice(4)
  data = Buffer.concat([Buffer.from(bytes,'hex'), data])
  return base58.encode(data)
}

const account2Address = (acountNode, index) => {
  const addressNode = acountNode.derivePath(`0/${index}`)
  const publicKey = addressNode.publicKey.toString('hex')
  const privateKey = addressNode.toWIF()

  const payment = bitcoin.payments.p2wpkh({ pubkey: addressNode.publicKey })
  const bc1Address = payment.address

  return {
    publicKey,
    privateKey,
    bc1Address
  }
}

const mnemonicChanged = async () => {
  acount0xpubField.innerText = ''
  acount0zpubField.innerText = ''
  zpubQRCode.clear()

  const mnemonic = mnemonicInput.value

  const valid = bip39lib.validateMnemonic(mnemonic)
  mnemonicInfo.innerText = `${valid ? '✅ Valid' : '🚨 Not Valid'} BIP39 Mnemonic`

  const words = valid ? mnemonic.split(' ') : []

  for (let i = 0; i < 24; ++i) {
    wordFields[i].innerText = (i < words.length ? words[i] : '')
  }

  if (!valid) return

  const bip39Seed = await bip39lib.mnemonicToSeed(mnemonic)
  const bip39HEX= bip39Seed.toString('hex')

  const bip32 = bip32lib.BIP32Factory(ecc)
  const hdNode = bip32.fromSeed(bip39Seed)

  const bip32XPRV = hdNode.toBase58()
  const bip32ZPRV = prvToPrv(bip32XPRV, 'zprv')

  //console.info('BIP32 Root Key - XPRV', bip32XPRV)
  //console.info('BIP32 Root Key - ZPRV', bip32ZPRV)

  const bip32XPUB = hdNode.neutered().toBase58()
  const bip32ZPUB = pubToPub(bip32XPUB, 'zpub')

  const path = "m/84'/0'/0'"
  const account0Node = hdNode.derivePath(path)

  const account0XPRV = account0Node.toBase58()
  const account0ZPRV = prvToPrv(account0XPRV, 'zprv')

  const account0XPUB = account0Node.neutered().toBase58()
  const account0ZPUB = pubToPub(account0XPUB, 'zpub')

  acount0xpubField.innerText = account0XPUB
  acount0zpubField.innerText = account0ZPUB
  zpubQRCode.makeCode(account0ZPUB)

  QRCode.toCanvas(zpubQRCode, account0ZPUB, function (error) {
    if (error) console.error(error)
  })

  //console.log('Account0 - ZPRV', account0ZPRV)
  //console.log('Account0 - ZPUB', account0ZPUB)

  const { publicKey, privateKey, bc1Address } = account2Address(account0Node, 0)
  console.log('Public Key', publicKey)
  console.log('Private Key', privateKey)
  console.log('bc1Address', bc1Address)

}

mnemonicInput.addEventListener('keyup', mnemonicChanged)

window.onload = () => {
  mnemonicChanged()
}

/*
inputQRCode.addEventListener("keyup", function(event) {
  event.preventDefault()
  console.log(inputQRCode.value)
  qrcode.clear()
  qrcode.makeCode(inputQRCode.value.trim())

  textId.innerText = inputQRCode.value

  const parts = inputQRCode.value.split('/')
  const codeFull = parts.at(-1)
  const codeParts = codeFull.split('-')
  const codeMinimized = codeParts.at(0).toUpperCase()

  minimizedCode.innerText = codeMinimized
})
*/
