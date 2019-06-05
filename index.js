const fetch = require('node-fetch')
const Price = require('ilp-price')
const ILDCP = require('ilp-protocol-ildcp')
const IlpPlugin = require('ilp-plugin')

async function convert (amount, foreignAssetCode, foreignAssetScale, preferredApi) {
  const plugin = IlpPlugin()
  const assetDetails = await getAssetDetails(plugin)
  const exchangeRate = await fetchRate(foreignAssetCode, foreignAssetScale, assetDetails.assetCode, assetDetails.assetScale, preferredApi)
  const exchangedAmount = Math.floor(amount * exchangeRate)
  return {
    amount: exchangedAmount,
    assetCode: assetDetails.assetCode,
    assetScale: assetDetails.assetScale
  }
}

async function getAssetDetails (plugin) {
  await plugin.connect()
  const details = await ILDCP.fetch(plugin.sendData.bind(plugin))
  return details
}

async function fetchRate (foreignAssetCode, foreignAssetScale, serverAssetCode, serverAssetScale, preferredApi) {
  if (foreignAssetCode === serverAssetCode) {
    return Math.pow(10, serverAssetScale - foreignAssetScale)
  }

  const apis = sortedApiList(preferredApi)
  let rate
  let scaledRate

  for (let api in apis) {
    rate = await apis[api](foreignAssetCode, serverAssetCode)
    if (rate) {
      scaledRate = rate * Math.pow(10, serverAssetScale - foreignAssetScale)
      break
    } else {
      rate = await apis[api](serverAssetCode, foreignAssetCode)
      if (rate) {
        scaledRate = (1 / rate) * Math.pow(10, serverAssetScale - foreignAssetScale)
        break
      }
    }
  }
  if (scaledRate) {
    return scaledRate
  } else {
    return false
  }
}

function sortedApiList (preferredApi) {
  const apiSet = new Set([eval(preferredApi), ilpprice, cryptocompare, bitstamp, bitsane])
  const apis = [...apiSet].filter(Boolean)
  if (apis.length === 4) {
    return apis
  } else {
    return [ilpprice, cryptocompare, bitstamp, bitsane]
  }
}

async function ilpprice (assetCode1, assetCode2) {
  const price = new Price()
  let asset1, asset2
  try {
    asset1 = await price.fetch(assetCode1, 1)
    asset2 = await price.fetch(assetCode2, 1)
    if (asset1 && asset2) {
      return asset1 / asset2
    }
    return false
  } catch (err) {
    return false
  }
}

async function cryptocompare (assetCode1, assetCode2) {
  const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${assetCode1}&tsyms=${assetCode2}`)
  if (response.ok) {
    const json = await response.json()
    return json[assetCode2]
  }
  return false
}

async function bitstamp (assetCode1, assetCode2) {
  const response = await fetch(`https://www.bitstamp.net/api/v2/ticker/${assetCode1}${assetCode2}/`)
  if (response.ok) {
    const json = await response.json()
    return json.last
  }
  return false
}

async function bitsane (assetCode1, assetCode2) {
  const response = await fetch(`https://bitsane.com/api/public/ticker?pairs=${assetCode1}_${assetCode2}`)
  if (response.ok) {
    const json = await response.json()
    try {
      return json[`${assetCode1}_${assetCode2}`].last
    } catch (err) {
      return false
    }
  }
  return false
}

module.exports = {
  convert,
  fetchRate
}
