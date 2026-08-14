exports.getServerTitle = function (serverDomain) {
  const cleanDom = serverDomain.replace("bysesukior", "Filemoon").replace("movearnpre", "Vidhide")
    .replace("luluvdo", "Lulustream").replace("dhcplay", "Streamwish").replace("listeamed", "Vidguard")
    .replace("rpmvip", "RPMshare").replace("yourupload", "YourUpload").replace("mp4upload", "MP4Upload").replace("Mp4upload", "MP4Upload")
    .replace("pdrain", "PDrain").replace("hls", "HLS")
    .replace(".com", "").replace(".net", "").replace(".org", "").replace(".top", "")
    .replace(".to", "").replace(".ac", "").replace(".sx", "").replace(".ps", "");
  return cleanDom.charAt(0).toUpperCase() + cleanDom.slice(1)
}

exports.GetStreamLinks = function (serviceName, serviceSlug, streamArray, onlyInternal = true) {
  if (streamArray?.data?.servers === undefined) throw Error("Invalid response!")
  let epName = (streamArray.data.number) ? streamArray.data.title + " Ep. " + streamArray.data.number : streamArray.data.title
  const externalStreams = streamArray.data.servers.filter((src) => src.embed !== undefined).map((source) => {
    return {
      externalUrl: source.embed,
      name: serviceName + "\n" + source.name + "⇗\n(external)" + ((source.dub) ? `\n🗣️🎙️(${(source.dubLang === "lat") ? "🇲🇽" : "🇪🇸"}DUB)` : ""),
      title: epName + "\n⚙️ (opens " + source.name + " in your browser)\n🔗 " + source.embed + ((source.dub) ? `\n🗣️🎙️(${(source.dubLang === "lat") ? "🇲🇽" : "🇪🇸"}DUB)` : `\n🇯🇵${(source.dubLang === "lat") ? "🇲🇽" : "🇪🇸"}`),
      behaviorHints: {
        bingeGroup: serviceSlug + "|" + source.name + "|ext",
        //filename: source.embed
      }
    }
  })
  //return externalStreams
  const downloadStreams = streamArray.data.servers.filter((src) => (src.embed !== undefined && ["YourUpload", "MP4Upload", "Streamwish", "SW", "Okru", "Voe", "Vidhide", "Hqq", "Filemoon", "HLS", "PDrain"].includes(src.name)))
  const promises = downloadStreams.map((source) => {
    /*if (source.name === "Stape") {
      return GetStreamTapeLink(source.download).then((realURL) => {
        return {
          url: realURL,
          name: serviceName + " - " + source.name + ((source.dub) ? `\n🗣️🎙️(${(source.dubLang==="lat")?"🇲🇽":"🇪🇸"}DUB)` : ""),
          title: epName + " via " + source.name + "\n" + realURL + ((source.dub) ? `\n🗣️🎙️(${(source.dubLang==="lat")?"🇲🇽":"🇪🇸"}DUB)` : `\n🇯🇵${(source.dubLang==="lat")?"🇲🇽":"🇪🇸"}`),
          behaviorHints: {
            bingeGroup: serviceSlug + "|" + source.name,
            filename: realURL,
            notWebReady: true
          }
        }
      }).catch((err) => {
        console.log("Failed getting StreamTape link:", err)
        return undefined
      })
    } else*/ if (source.name === "YourUpload") {
      return GetYourUploadLink(source.embed).then((realURL) => {
        return FormatStream(realURL, source, epName, serviceName, serviceSlug, "https://yourupload.com")
      }).catch((err) => {
        console.error("Failed getting YourUpload link:", err)
        return undefined
      })
    } else if (source.name === "MP4Upload") {
      return GetMP4UploadLink(source.embed).then((realURL) => {
        return FormatStream(realURL, source, epName, serviceName, serviceSlug, "https://a1.mp4upload.com")
      }).catch((err) => {
        console.error("Failed getting MP4Upload link:", err)
        return undefined
      })
    } else if (source.name === "Voe") {
      return GetVoeLink(source.embed).then((realURL) => {
        return FormatStream(realURL, source, epName, serviceName, serviceSlug, new URL(source.embed).hostname)
      }).catch((err) => {
        console.error("Failed getting Voe link:", err)
        return undefined
      })
    } else if (source.name === "Vidhide") {
      return GetVidhideLink(source.embed).then((realURL) => {
        return FormatStream(realURL, source, epName, serviceName, serviceSlug, new URL(source.embed).hostname)
      }).catch((err) => {
        console.error("Failed getting Vidhide link:", err)
        return undefined
      })
    } else if (source.name === "Hqq") {
      return GetHqqLink(source.embed).then((realURL) => {
        return FormatStream(realURL, source, epName, serviceName, serviceSlug, new URL(source.embed).hostname)
      }).catch((err) => {
        console.error("Failed getting Hqq link:", err)
        return undefined
      })
    } else if (source.name === "Filemoon") {
      return GetFilemoonLink(source.embed).then((realURL) => {
        return FormatStream(realURL, source, epName, serviceName, serviceSlug, new URL(source.embed).hostname)
      }).catch((err) => {
        console.error("Failed getting Filemoon link:", err)
        return undefined
      })
    } else if (source.name === "Okru") {
      return GetOkruLink(source.embed).then((realURL) => {
        return FormatStream(realURL, source, epName, serviceName, serviceSlug, new URL(source.embed).hostname)
      }).catch((err) => {
        console.error("Failed getting Okru link:", err)
        return undefined
      })
    } else if ((source.name === "Streamwish") || (source.name === "SW")) {
      return GetStreamwishLink(source.embed).then((realURL) => {
        return FormatStream(realURL, source, epName, serviceName, serviceSlug, new URL(source.embed).hostname)
      }).catch((err) => {
        console.error("Failed getting Streamwish link:", err)
        return undefined
      })
    } else if (source.name === "PDrain") {
      return GetPDrainLink(source.embed).then((realURL) => {
        return FormatStream(realURL, source, epName, serviceName, serviceSlug, new URL(source.embed).hostname)
      }).catch((err) => {
        console.error("Failed getting PDrain link:", err)
        return undefined
      })
    } else if (source.name === "HLS") {
      return GetHLSLink(source.embed).then((realURL) => {
        return FormatStream(realURL, source, epName, serviceName, serviceSlug, new URL(source.embed).hostname)
      }).catch((err) => {
        console.error("Failed getting HLS link:", err)
        return undefined
      })
    }
  })

  return Promise.allSettled(promises).then((results) => {
    const internalStreams = results.filter((prom) => (prom.value)).map((source) => source.value)
    return (onlyInternal) ? internalStreams : internalStreams.concat(externalStreams)
  })
}

function FormatStream(realURL, source, epName, serviceName, serviceSlug, referer = undefined) {
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
  const proxyURL = require("../routes/proxy.js").BuildProxyURL(realURL, referer, userAgent)
  //If PUBLIC_URL is set, we proxy the video ourselves (applying the correct Referer/User-Agent server-side),
  //which works even on Stremio clients that ignore proxyHeaders. Otherwise, fall back to asking Stremio
  //to add those headers itself when it requests the video directly from the host.
  return {
    url: proxyURL || realURL,
    name: serviceName + "\n" + source.name + ((source.dub) ? `\n🗣️🎙️(${(source.dubLang === "lat") ? "🇲🇽" : "🇪🇸"}DUB)` : ""),
    title: epName + "\n⚙️ " + source.name + "\n🔗 " + realURL + ((source.dub) ? `\n🗣️🎙️(${(source.dubLang === "lat") ? "🇲🇽" : "🇪🇸"}DUB)` : `\n🇯🇵${(source.dubLang === "lat") ? "🇲🇽" : "🇪🇸"}`),
    behaviorHints: {
      bingeGroup: serviceSlug + "|" + source.name,
      //filename: realURL,
      notWebReady: !proxyURL,
      ...(!proxyURL) && {
        proxyHeaders: {
          request: {
            "Referer": referer,
            "User-Agent": userAgent
          },
          response: {
            "User-Agent": userAgent
          }
        }
      }
    }
  }
}

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "*/*",
};

const HTML_HEADERS = {
  "User-Agent": DEFAULT_HEADERS["User-Agent"],
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
};

function fetchPromise(url, headers = undefined) {
  return fetch(url, headers).then((resp) => {
    if ((!resp.ok) || resp.status !== 200) throw Error(`HTTP error! Status: ${resp.status}`)
    if (resp === undefined) throw Error(`Undefined response!`)
    return resp.text()
  })
}

//--- Streamwish-family (Streamwish/SW, Filemoon, Vidhide and their "mutant" clone domains) ---
//These sites commonly ship the real <video> source packed inside an eval(function(p,a,c,k,e,d){...}(...))
//obfuscated block (the classic Dean Edwards JS packer), and sometimes do a simple client-side
//redirect (window.location / meta refresh) to a sibling domain before that. Adapted (fetch-based,
//no headless browser) from a similar resolver used in another addon (PoseidonHD2).
function unpackPackedJs(p, a, c, k) {
  while (c--) {
    if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c])
  }
  return p
}

function makeAbsoluteEmbedUrl(url, base) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  if (url.indexOf('//') === 0) return 'https:' + url
  if (url.indexOf('/') === 0) {
    try { return new URL(base).origin + url } catch (e) { return base + url }
  }
  return base + '/' + url
}

//Extracts and unpacks every eval(function(p,a,c,k,e,d)...) block found in an HTML/script string
function unpackEvalBlocks(html) {
  const evalRegex = /eval\(\s*function\s*\(p,a,c,k,e,[rd]\)[\s\S]*?\}\s*\(\s*'([\s\S]*?)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]*?)'\s*\.split\('\|'\)/g
  let match, unpacked = ''
  while ((match = evalRegex.exec(html)) !== null) {
    try {
      unpacked += '\n' + unpackPackedJs(match[1], parseInt(match[2], 10), parseInt(match[3], 10), match[4].split('|'))
    } catch (e) { /* skip malformed block */ }
  }
  return unpacked
}

//A same-page client-side redirect (window.location.href = "...", meta refresh, or an <iframe> to a sibling embed domain)
function findMutantRedirect(html, base) {
  const patterns = [
    /window\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i,
    /location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/i,
    /<meta[^>]+http-equiv\s*=\s*['"]refresh['"][^>]+content\s*=\s*['"][^'">\s]+url=([^'">\s]+)/i,
    /<iframe[^>]+src\s*=\s*['"]([^'"]+\/(?:e|embed)\/[a-zA-Z0-9]+[^'"]*)['"]/i
  ]
  for (const pattern of patterns) {
    const m = html.match(pattern)
    if (m && m[1]) return makeAbsoluteEmbedUrl(m[1], base)
  }
  return null
}

//Tries to find an .m3u8/.mp4 link in already-unpacked JS + the raw HTML of a Streamwish-family embed page.
//Follows a single client-side redirect hop if the page itself doesn't have the video yet
//(e.g. streamwish.to/e/ID -> some-mutant-domain.com/e/ID).
async function ResolveStreamwishFamilyLink(embedUrl, hops = 2) {
  let currentUrl = embedUrl
  for (let hop = 0; hop < hops; hop++) {
    const html = await fetchPromise(currentUrl, { headers: HTML_HEADERS })
    const origin = new URL(currentUrl).origin
    const unpacked = unpackEvalBlocks(html)
    const combined = unpacked + '\n' + html

    const link = findFirstUrl(combined, [
      /(https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*)/i,
      /(https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*)/i,
      /file\s*:\s*["'](https?:[^\s"']+)["']/i,
      /sources?\s*:\s*\[\s*\{[^}]*(?:file|src)\s*:\s*["'](https?:[^\s"']+)["']/i,
      /"file"\s*:\s*"([^"]+)"/i,
    ])
    if (link && !link.startsWith("blob:") && isLikelyVideoUrl(link)) return link

    const nextUrl = findMutantRedirect(html, origin)
    if (!nextUrl || nextUrl === currentUrl) break
    currentUrl = nextUrl
  }
  return null
}
//--- End Streamwish-family utilities ---

//Adapted from https://github.com/FxxMorgan/anime1v-api
function normalizeExtractedUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  return value
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&")
    .replace(/%3A/gi, ":")
    .replace(/%2F/gi, "/")
    .replace(/%3F/gi, "?")
    .replace(/%3D/gi, "=")
    .trim();
}
//Adapted from https://github.com/FxxMorgan/anime1v-api
function findFirstUrl(payload, patterns) {
  if (!payload || typeof payload !== "string") {
    return null;
  }

  for (const pattern of patterns) {
    try {
      const match = payload.match(pattern);
      if (match && match[1]) {
        const candidate = normalizeExtractedUrl(match[1]);
        if (candidate) {
          return candidate;
        }
      }
    } catch (_e) {
      // Skip invalid patterns silently
    }
  }
  return null;
}
//Adapted from https://github.com/FxxMorgan/anime1v-api
function isLikelyVideoUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  const lower = url.toLowerCase();
  const excludePatterns = [
    "cloudflareinsights",
    "google-analytics",
    "googletagmanager",
    "facebook.net",
    "beacon.min.js",
    ".js?",
    "analytics",
    "pixel",
    "bigbuckbunny",
    "test-videos",
    "sample-video",
    "placeholder",
  ];

  for (const pattern of excludePatterns) {
    if (lower.includes(pattern)) {
      return false;
    }
  }

  // Accept .mp4, .m3u8 (HLS), or direct video URLs
  return /\.(mp4|m3u8)$/i.test(url) || lower.includes("video") || lower.includes("stream") || lower.includes(".mp4") || lower.includes(".m3u8");
}

//Adapted from https://github.com/ChristopherProject/Streamtape-Video-Downloader
GetStreamTapeLink = function (url) {
  const reqURL = url.replace("/e/", "/v/")
  return fetchPromise(reqURL).then((data) => {
    const matches = /document\.getElementById\('norobotlink'\)\.innerHTML = (.+?);/g.exec(data)
    if (matches[1]) {
      const tokenMatches = /token=([^&']+)/g.exec(matches[1])
      if (tokenMatches[1]) {
        const STPattern = /id\s*=\s*"ideoooolink"/g
        const tagEnd = data.indexOf(">", STPattern.exec(data).index) + 1
        const streamtape = data.substring(tagEnd, data.indexOf("<", tagEnd))
        return `https:/${streamtape}&token=${tokenMatches[1]}&dl=1s`
      } else console.log("No token")
    } else console.log("No norobotlink")
  })
}

GetYourUploadLink = function (url) {
  return fetchPromise(url).then((data) => {
    const metaMatch = /property\s*=\s*"og:video"/g.exec(data)
    if (metaMatch[0]) {
      const vidMatch = /content\s*=\s*"(\S+)"/g.exec(data.substring(metaMatch.index))
      if (vidMatch[1]) {
        return vidMatch[1]
      } else console.log("No video link")
    } else console.log("No video")
  })
}

GetHLSLink = function (url) {
  if (url.includes("/play/") || url.includes("/m3u8/")) {
    return Promise.resolve(url.replace("/play/", "/m3u8/"))
  } else { console.log("No video link"); return Promise.reject("No video link") }
}

GetPDrainLink = function (url) {
  const metaMatch = /(.+?:\/\/.+?)\/.+?\/(.+?)(?:\?embed)?$/g.exec(url)
  if (metaMatch && metaMatch[0]) {
    return Promise.resolve(`${metaMatch[1]}/api/file/${metaMatch[2]}`)
  } else { console.log("No video link"); return Promise.reject("No video link") }
}

GetMP4UploadLink = function (url) {
  return fetchPromise(url).then((data) => {
    const metaMatch = /<script(?:.|\n)+?src:(?:.|\n)*?"(.+?\.mp4)"/g.exec(data)
    if (metaMatch && metaMatch[0]) {
      return metaMatch[1]
    } else console.log("No video link")
  })
}
//Adapted from https://github.com/FxxMorgan/anime1v-api
GetOkruLink = function (url) {
  return fetchPromise(url).then((data) => {
    const link = findFirstUrl(data, [
      /"metadata"\s*:\s*\{[^}]*"url"\s*:\s*"([^"]+)"/i,
      /flashvars\s*=\s*\{[^}]*src\s*:\s*"([^"]+)"/i,
      /videoUrl\s*=\s*"([^"]+)"/i,
    ])
    return isLikelyVideoUrl(link) ? link : Promise.reject("No video link")
  })
}
//Adapted from https://github.com/FxxMorgan/anime1v-api, extended with eval(p,a,c,k) unpacking
GetVidhideLink = function (url) {
  return ResolveStreamwishFamilyLink(url).then((link) => {
    if (link) return link
    return fetchPromise(url).then((data) => {
      const fallbackLink = findFirstUrl(data, [
        /sources?\s*:\s*\[\s*\{[^}]*(?:file|src)\s*:\s*["'](https?:\/\/[^"']+)["']/i,
        /"file"\s*:\s*"([^"]+)"/i,
        /"source"\s*:\s*"([^"]+)"/i,
        /file\s*:\s*'([^']+)'/i,
      ])
      return isLikelyVideoUrl(fallbackLink) ? fallbackLink : Promise.reject("No video link")
    })
  })
}
//Adapted from https://github.com/FxxMorgan/anime1v-api, extended with eval(p,a,c,k) unpacking
GetFilemoonLink = function (url) {
  return ResolveStreamwishFamilyLink(url).then((link) => {
    if (link) return link
    return fetchPromise(url).then((data) => {
      const fallbackLink = findFirstUrl(data, [
        /sources?\s*:\s*\[\s*\{[^}]*src\s*:\s*["']([^"']+)["']/i,
        /file\s*:\s*"([^"\)]+)"/i,
      ])
      return isLikelyVideoUrl(fallbackLink) ? fallbackLink : Promise.reject("No video link")
    })
  })
}
//Adapted from https://github.com/FxxMorgan/anime1v-api
GetHqqLink = function (url) {
  return fetchPromise(url).then((data) => {
    const link = findFirstUrl(data, [
      /sources?\s*:\s*\[\s*\{[^}]*file\s*:\s*["'](https?:\/\/[^"']+)["']/i,
      /file\s*:\s*"([^"]+\.mp4[^"]*)"/i,
      /video(?:\d+)?\s*=\s*["']([^"']+\.mp4[^"']+)["']/i,
    ])
    return isLikelyVideoUrl(link) ? link : Promise.reject("No video link")
  })
}
//Adapted from https://github.com/FxxMorgan/anime1v-api
GetFembedLink = function (url) {
  return fetchPromise(url).then((data) => {
    const link = findFirstUrl(data, [
      /sources?\s*:\s*\[\s*\{[^}]*src\s*:\s*["']([^"']+)["']/i,
      /file["']?\s*:\s*["']([^"']+)["']/i,
      /video\s*=\s*["']([^"']+\.mp4[^"']*)["']/i,
    ])
    return isLikelyVideoUrl(link) ? link : Promise.reject("No video link")
  })
}
//Adapted from https://github.com/FxxMorgan/anime1v-api, extended with eval(p,a,c,k) unpacking + redirect-following
GetStreamwishLink = function (url) {
  return ResolveStreamwishFamilyLink(url).then((link) => {
    if (link) return link
    //Fallback: the page-level regex attempts that worked before unpacking was added
    return fetchPromise(url).then((data) => {
      const m3u8Match = data.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i);
      if (m3u8Match && m3u8Match[1]) {
        const candidate = m3u8Match[1];
        if (!candidate.startsWith("blob:")) return candidate;
      }
      const fallbackLink = findFirstUrl(data, [
        /(https?:[^\s"']+\.m3u8[^\s"']*)/i,
        /file\s*:\s*["'](https?:[^\s"']+)["']/i,
        /sources\s*:\s*\[\s*\{[^}]*file\s*:\s*["'](https?:[^\s"']+)["']/i,
        /"file"\s*:\s*"([^"]+)"/i,
        /player\.config\s*=\s*\{[^}]*file\s*:\s*["']([^"']+)["']/i,
        /player\.setup\(\{[^}]*file\s*:\s*["']([^"']+)["']/i,
        /player\.setup\([\s\S]*?sources\s*:\s*\[[\s\S]*?src\s*:\s*["']([^"']+)["']/i,
      ])
      if (fallbackLink && !fallbackLink.startsWith("blob:") && isLikelyVideoUrl(fallbackLink)) return fallbackLink
      const dataMatch = data.match(/data-src=["']([^"']+\.m3u8[^"']*)["']/i);
      if (dataMatch && dataMatch[1] && !dataMatch[1].startsWith("blob:")) return normalizeExtractedUrl(dataMatch[1])
      return Promise.reject("No video link")
    })
  })
}
//Adapted from https://github.com/FxxMorgan/anime1v-api
GetVoeLink = function (url, referer = undefined) {
  const headers = { ...HTML_HEADERS };
  if (referer) {
    headers.Referer = referer;
  }
  return fetchPromise(url, { headers }).then((data) => {
    let html = data
    // Check for redirect in page
    const redirectMatch = data.match(/window\.location\.href\s*=\s*['"](https?:\/\/[^'"]+)['"]/i);
    if (redirectMatch && redirectMatch[1]) {
      return fetchPromise(redirectMatch[1], { headers })
    } else return html
  }).then((data) => {
    const link = findFirstUrl(data, [
      /sources?\s*:\s*\[\s*\{[^}]*src\s*:\s*["']([^"']+)["']/i,
      /"file"\s*:\s*"([^"]+)"/i,
      /(https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8)[^\s"'<>]*)/i,
    ])
    return isLikelyVideoUrl(link) ? link : Promise.reject("No video link")
  })
}
