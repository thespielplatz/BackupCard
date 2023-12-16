const ADDRESSES_PER_PAGE = 8

const seedFieldTemplate = document.getElementById('template-seed-field').innerHTML
const addressBoxTemplate = document.getElementById('template-address-box').innerHTML
const addressSheetTemplate = document.getElementById('template-address-sheet').innerHTML

const loadingIndicator = document.getElementById('loading')
const seedGrid = document.getElementById('seed-grid')
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

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const hide = (element) => {
  element.className += 'hidden'
}

const show = (element) => {
  element.className = element.className.split(' ').filter((className => className != 'hidden')).join(' ')
}

zpubQRCode.clear()

const wordFields = []
let addressIndex = 0
let account0Node

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

const createAddressPage = () => {
  const addressPage = document.createElement('section')
  addressPage.setAttribute('class', 'sheet padding-10mm')
  addressPage.setAttribute('data-address-page', 'true')
  addressPage.innerHTML = addressSheetTemplate
  document.getElementById('theBody').appendChild(addressPage)
  return addressPage
}

const mnemonicChanged = async (mnemonic) => {
  acount0xpubField.innerText = ''
  acount0zpubField.innerText = ''
  zpubQRCode.makeCode('notvalid')
  account0Node = null
  addressIndex = 0

  document.querySelectorAll('[data-address-page=true]').forEach(element => {
    element.remove()
  })

  const valid = bip39lib.validateMnemonic(mnemonic)
  mnemonicInfo.innerText = `${valid ? '✅ Valid' : '🚨 Not Valid'} BIP39 Mnemonic`

  const words = valid ? mnemonic.split(' ') : []

  for (let i = 0; i < 24; ++i) {
    wordFields[i].innerText = (i < words.length ? words[i] : '')
  }

  if (!valid) {
    return
  }

  const bip39Seed = await bip39lib.mnemonicToSeed(mnemonic)
  const bip39HEX = bip39Seed.toString('hex')

  const bip32 = bip32lib.BIP32Factory(ecc)
  const hdNode = bip32.fromSeed(bip39Seed)

  const bip32XPRV = hdNode.toBase58()
  const bip32ZPRV = prvToPrv(bip32XPRV, 'zprv')

  //console.info('BIP32 Root Key - XPRV', bip32XPRV)
  //console.info('BIP32 Root Key - ZPRV', bip32ZPRV)

  const bip32XPUB = hdNode.neutered().toBase58()
  const bip32ZPUB = pubToPub(bip32XPUB, 'zpub')

  const path = "m/84'/0'/0'"
  account0Node = hdNode.derivePath(path)

  const account0XPRV = account0Node.toBase58()
  const account0ZPRV = prvToPrv(account0XPRV, 'zprv')

  const account0XPUB = account0Node.neutered().toBase58()
  const account0ZPUB = pubToPub(account0XPUB, 'zpub')

  acount0xpubField.innerText = account0XPUB
  acount0zpubField.innerText = account0ZPUB
  zpubQRCode.makeCode(account0ZPUB)

  //console.log('Account0 - ZPRV', account0ZPRV)
  //console.log('Account0 - ZPUB', account0ZPUB)

  addAddressPage()
}

const addAddressPage = () => {
  let addressGrid

  for (let i = 0; i < ADDRESSES_PER_PAGE; ++i) {
    if (i % ADDRESSES_PER_PAGE === 0) {
      const addressPage = createAddressPage()
      addressPage.getElementsByTagName('h1')[0].innerHTML = `Addresses from ${addressIndex} to ${addressIndex + ADDRESSES_PER_PAGE - 1}`
      addressGrid = addressPage.getElementsByClassName('address-grid')[0]
    }
    const { bc1Address } = account2Address(account0Node, addressIndex)

    const div = document.createElement('div')
    div.innerHTML = addressBoxTemplate
    addressGrid.appendChild(div)

    div.getElementsByTagName('span')[0].innerText = `m/84'/0'/0'/0/${addressIndex}`
    new QRCode(div.getElementsByClassName('address-qrcode')[0], {
      text: bc1Address,
      width: 175,
      height: 175,
    })
    div.getElementsByClassName('address-bc1')[0].innerHTML = bc1Address

    addressIndex++
  }
}

const EMPTY_STRING = ''
let currentMnemonic = EMPTY_STRING
mnemonicInput.addEventListener('keyup',  async () => {
  if (currentMnemonic !== EMPTY_STRING) {
    if (currentMnemonic === mnemonicInput.value) {
      return
    }
  }

  while (currentMnemonic !== EMPTY_STRING) {
    await wait(100)
  }

  currentMnemonic = mnemonicInput.value

  show(loadingIndicator)
  await wait(10)
  await mnemonicChanged(currentMnemonic)
  hide(loadingIndicator)

  currentMnemonic = EMPTY_STRING
})
document.getElementById('btnAddAddressPage').addEventListener('click', () => {
  show(loadingIndicator)
  addAddressPage()
  hide(loadingIndicator)
})

hide(loadingIndicator)

window.onload = () => {
}
