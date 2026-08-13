const express = require("express")
const proxy = express.Router()
const { Readable } = require("stream")

require('dotenv').config()//process.env.var

const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"

/**
 * Builds the public, proxied URL for a video, if PUBLIC_URL is configured.
 * @param {string} targetURL - the real, upstream video URL
 * @param {string} [referer] - Referer header the upstream host expects
 * @param {string} [userAgent] - User-Agent header to send upstream
 * @returns {string|null} the proxied URL (pointing back at this same server), or null if PUBLIC_URL isn't set
 */
function BuildProxyURL(targetURL, referer = undefined, userAgent = DEFAULT_USER_AGENT) {
  const base = (process.env.PUBLIC_URL || "").trim().replace(/\/$/, "")
  if (!base) return null
  const params = new URLSearchParams({ url: targetURL, ua: userAgent })
  if (referer) params.set("referer", referer)
  return `${base}/proxy/stream?${params.toString()}`
}

/**
 * Fetches the real video from the upstream host (with the correct Referer/User-Agent/Range headers)
 * and pipes it straight through to the Stremio player, so the player never has to talk to the
 * (often Referer-blocked) video host directly.
 */
async function HandleProxyStream(req, res) {
  const targetURL = req.query.url
  if (!targetURL) {
    res.status(400).send("Missing url parameter")
    return
  }
  const headers = { "User-Agent": req.query.ua || DEFAULT_USER_AGENT }
  if (req.query.referer) headers["Referer"] = req.query.referer
  if (req.headers.range) headers["Range"] = req.headers.range

  try {
    const originResp = await fetch(targetURL, { headers })
    if (!originResp.ok && originResp.status !== 206) {
      console.error(`\x1b[31mProxy: upstream responded ${originResp.status} for\x1b[39m ${targetURL}`)
      res.status(originResp.status).send(`Upstream error: ${originResp.status}`)
      return
    }
    res.status(originResp.status)
    for (const headerName of ["content-type", "content-length", "content-range", "accept-ranges"]) {
      const val = originResp.headers.get(headerName)
      if (val) res.setHeader(headerName, val)
    }
    res.setHeader("Access-Control-Allow-Origin", "*")
    if (!originResp.body) {
      res.end()
      return
    }
    Readable.fromWeb(originResp.body).pipe(res)
  } catch (err) {
    console.error('\x1b[31mProxy stream failed:\x1b[39m ' + err)
    if (!res.headersSent) res.status(502).send("Proxy error: " + err.message)
  }
}

proxy.get("/proxy/stream", HandleProxyStream)

module.exports = { router: proxy, BuildProxyURL }
