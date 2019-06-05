# ILP Exchange Rate

## Description

Converts a given amount, assetCode, and asset Scale to the ILP provider's assetCode and assetScale. Alternatively, you can fetch the exchange rate of two assets given their assetCode and assetScale. 

## Usage
```js
const Exchange = require('ilp-exchange-rate')

const foreignAssetCode = 'USD'
const foreignAssetScale = 2
const amount = 100            //1 USD

async function conversion () {
  const convertedAsset = await Exchange.convert(amount, foreignAssetCode, foreignAssetScale)
  console.log(convertedAsset)
}

const ownAssetCode = 'XRP'
const ownAssetScale = 6

async function fetchRate () {
  const exchangeRate = await Exchange.fetchRate (foreignAssetCode, foreignAssetScale, ownAssetCode, ownAssetScale)
  console.log(exchangeRate)
}

conversion()
// { amount: 2540000000, assetCode: 'XRP', assetScale: 9 }
fetchRate()
// 25400
```

## Advanced Usage
The module comes with the following exchange rate APIs
* [ilpprice](https://github.com/interledgerjs/ilp-price)
* [cryptocompare](https://min-api.cryptocompare.com/)
* [bitstamp](https://www.bitstamp.net/api/)
* [bitsane](https://bitsane.com/help/api)

You may choose your preferred API
```js
async function conversion () {
  const convertedAsset = await Exchange.convert(amount, foreignAssetCode, foreignAssetScale, 'bitstamp')
  console.log(convertedAsset)

async function fetchRate () {
  const exchangeRate = await Exchange.fetchRate (foreignAssetCode, foreignAssetScale, ownAssetCode, ownAssetScale, 'bitstamp')
  console.log(exchangeRate)
}

conversion()
// { amount: 2540521314, assetCode: 'XRP', assetScale: 9 }

fetchRate()
// 25405.213149738323
```