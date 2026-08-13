require('dotenv').config()//process.env.var

const TMDB_API_BASE = "https://api.themoviedb.org/3"

function GetTMDBAuthToken() {
  return { "Authorization": `Bearer ${process.env.TMDB_API_READ_TOKEN}` }
}

//In-memory cache of { tmdbID: [{season_number, episode_count}, ...] } so we don't hit TMDB on every request
const seasonCountsCache = new Map()

/**
 * Fetches (and caches) the episode count per season for a TMDB series.
 * @param {String|Number} tmdbID
 * @returns {Promise<Array<{season_number:number, episode_count:number}>>}
 */
async function GetTMDBSeasonCounts(tmdbID) {
  if (seasonCountsCache.has(tmdbID)) return seasonCountsCache.get(tmdbID)
  const reqURL = `${TMDB_API_BASE}/tv/${tmdbID}`
  const resp = await fetch(reqURL, { headers: GetTMDBAuthToken() })
  if (!resp.ok) throw new Error(`HTTP error! Status: ${resp.status}`)
  const data = await resp.json()
  if (!data?.seasons) throw new Error("Invalid response! (no seasons array)")
  //Exclude season 0 (specials), sort ascending
  const seasons = data.seasons
    .filter((s) => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number)
    .map((s) => ({ season_number: s.season_number, episode_count: s.episode_count }))
  seasonCountsCache.set(tmdbID, seasons)
  return seasons
}

/**
 * Converts a (season, episode) pair from TMDB numbering into an absolute episode number
 * (i.e. counting every episode of every previous season as if the show had a single continuous season).
 * This mirrors how AnimeFLV/AnimeAV1/Henaojara/TioAnime/JKAnime number their episodes internally.
 * @param {String|Number} tmdbID - TMDB series ID (not needed/used for movies)
 * @param {String} mediaType - "series" or "movie"
 * @param {String|Number} season - requested season number (1-based). Season 0/specials are not supported here.
 * @param {String|Number} episode - requested episode number within that season
 * @returns {Promise<Number|undefined>} the absolute episode number, or undefined if it can't be computed
 * (missing TMDB credentials, season 0/specials, movie, or a TMDB API failure) - callers should fall back
 * to the old title+season text search in that case.
 */
async function GetAbsoluteEpisode(tmdbID, mediaType, season, episode) {
  if (!tmdbID || !episode) return undefined
  if (mediaType === "movie") return undefined
  const seasonNum = parseInt(season)
  const episodeNum = parseInt(episode)
  if (!seasonNum || seasonNum <= 0 || !episodeNum) return undefined //no season (movie-like) or a special (season 0)
  if (seasonNum === 1) return episodeNum //no translation needed, already absolute from ep. 1
  if (!process.env.TMDB_API_READ_TOKEN) return undefined //can't query TMDB without credentials
  try {
    const seasons = await GetTMDBSeasonCounts(tmdbID)
    let previousEpisodes = 0
    for (const s of seasons) {
      if (s.season_number >= seasonNum) break
      previousEpisodes += s.episode_count || 0
    }
    return previousEpisodes + episodeNum
  } catch (err) {
    console.error('\x1b[31mFailed getting TMDB season counts, falling back to text search:\x1b[39m ' + err)
    return undefined
  }
}

/**
 * Resolves which slug + episode number to request from a given site, trying the absolute-numbering
 * translation first (matching the site's own root/base title, no season suffix) and falling back to the
 * old fuzzy "{title} {season}" text search (using the raw within-season episode number) if the absolute
 * episode doesn't fit within the matched entry, or if we don't have an absolute episode to try at all.
 * @param {Object} opts
 * @param {(title:string)=>Promise<Array<{title:string,slug:string,type?:string}>>} opts.searchFn - unary search function (already bound with any site-specific extra args, e.g. type/genre)
 * @param {(slug:string)=>Promise<{videos:Array}>} opts.getBySlugFn - unary function returning the full anime info (needs .videos to check episode count)
 * @param {Object} opts.fuzzysort - the fuzzysort module
 * @param {string} opts.baseTitle - the show's title with no season number appended
 * @param {string} opts.searchTermWithSeason - the old-style "{title} {season}" search term (fallback path)
 * @param {number|undefined} opts.absoluteEpisode - from {@link GetAbsoluteEpisode}, or undefined to skip straight to the fallback
 * @param {string|number} opts.rawEpisode - the original, within-season episode number (fallback path)
 * @param {string} [opts.type] - "movie" or "series", used to prefer same-type results when nothing matches well
 * @returns {Promise<{slug:string, episode:number|string}>}
 */
async function ResolveEpisode({ searchFn, getBySlugFn, fuzzysort, baseTitle, searchTermWithSeason, absoluteEpisode, rawEpisode, type }) {
  if (absoluteEpisode !== undefined) {
    try {
      const candidates = await searchFn(baseTitle)
      if (candidates?.length > 0) {
        const match = fuzzysort.go(baseTitle, candidates, { key: 'title', limit: 1 })[0]?.obj
          || candidates.sort((a, b) => (a.type === type && b.type !== type) ? -1 : 0)[0]
        if (match) {
          const info = await getBySlugFn(match.slug)
          const epCount = info?.videos?.length || 0
          if (absoluteEpisode <= epCount) {
            console.log(`\x1b[32mResolved via absolute numbering:\x1b[39m ${match.title} -> episode ${absoluteEpisode}/${epCount}`)
            return { slug: match.slug, episode: absoluteEpisode }
          }
          console.log(`\x1b[33mAbsolute episode ${absoluteEpisode} exceeds ${match.title}'s ${epCount} episodes, falling back to season-text search\x1b[39m`)
        }
      }
    } catch (err) {
      console.error('\x1b[31mAbsolute-numbering resolution failed, falling back to season-text search:\x1b[39m ' + err)
    }
  }
  //Fallback: old behavior
  const candidates = await searchFn(searchTermWithSeason)
  if (!candidates || candidates.length < 1) throw new Error("No search results!")
  const match = fuzzysort.go(searchTermWithSeason, candidates, { key: 'title', limit: 1 })[0]?.obj
    || candidates.sort((a, b) => (a.type === type && b.type !== type) ? -1 : 0)[0]
  if (!match) throw new Error("No search results!")
  return { slug: match.slug, episode: rawEpisode }
}

module.exports = { GetAbsoluteEpisode, ResolveEpisode, GetTMDBSeasonCounts }
