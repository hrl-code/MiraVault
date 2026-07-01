const axios = require('axios').default
const { getStore } = require('./storeHelper')

const CINEMETA_BASE_URL = 'https://v3-cinemeta.strem.io'
const TVMAZE_BASE_URL = 'https://api.tvmaze.com'
const OPEN_LIBRARY_URL = 'https://openlibrary.org/search.json'
const WIKIDATA_SEARCH_URL = 'https://www.wikidata.org/w/api.php'
const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql'
const WIKIPEDIA_SUMMARY_BASE = 'https://es.wikipedia.org/api/rest_v1/page/summary'
const COMMONS_FILE_BASE = 'https://commons.wikimedia.org/wiki/Special:FilePath'
const REQUEST_TIMEOUT = 9000
const CACHE_TTL = 1000 * 60 * 60 * 24 * 45
const EMPTY_METADATA = {
  poster: '',
  synopsis: '',
  genres: [],
  duration: '',
  director: '',
  cast: [],
  rating: '',
  provider: ''
}

const DEFAULT_HEADERS = {
  'User-Agent': 'MiraVault/1.0 (open-source media library; no api key)',
  Accept: 'application/json,text/plain,*/*',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
}

function cleanText(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeCompare(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function metadataCacheKey(base) {
  return `${base.type || 'movie'}:${normalizeCompare(base.title)}:${cleanText(base.year)}`
}

function mergeMetadata(...entries) {
  const result = { ...EMPTY_METADATA }
  for (const entry of entries) {
    if (!entry) continue
    for (const key of ['poster', 'synopsis', 'duration', 'director', 'rating', 'provider']) {
      if (!result[key] && entry[key]) result[key] = entry[key]
    }
    if (result.genres.length === 0 && Array.isArray(entry.genres) && entry.genres.length) result.genres = entry.genres
    if (result.cast.length === 0 && Array.isArray(entry.cast) && entry.cast.length) result.cast = entry.cast
  }
  return result
}

function hasUsefulMetadata(entry) {
  return Boolean(entry?.poster || entry?.synopsis || entry?.rating || entry?.genres?.length || entry?.cast?.length)
}

function ratingFromMeta(meta) {
  return cleanText(meta?.imdbRating || meta?.rating || meta?.score || '')
}

function extractYear(value) {
  return cleanText(value).match(/\b(19|20)\d{2}\b/)?.[0] || ''
}

function computeScore(candidate, title, year = '') {
  const baseTitle = normalizeCompare(title)
  const candidateTitle = normalizeCompare(candidate?.name || candidate?.title || '')
  const baseYear = cleanText(year)
  const candidateYear = extractYear(candidate?.year || candidate?.premiered || candidate?.released || candidate?.first_air_date || '')

  let score = 0
  if (!candidateTitle) return score
  if (candidateTitle === baseTitle) score += 130
  if (candidateTitle.includes(baseTitle) || baseTitle.includes(candidateTitle)) score += 65

  const baseTokens = new Set(baseTitle.split(' ').filter(Boolean))
  const candidateTokens = new Set(candidateTitle.split(' ').filter(Boolean))
  for (const token of baseTokens) {
    if (candidateTokens.has(token)) score += 8
  }

  if (baseYear && candidateYear) {
    if (baseYear === candidateYear) score += 45
    else if (Math.abs(Number(baseYear) - Number(candidateYear)) <= 1) score += 12
  }

  return score
}

async function fetchJson(url, params = null, timeout = REQUEST_TIMEOUT) {
  const { data } = await axios.get(url, {
    params: params || undefined,
    timeout,
    headers: DEFAULT_HEADERS,
    maxRedirects: 5
  })
  return data
}

async function getCachedMetadata(key) {
  try {
    const store = await getStore()
    const cache = store.get('metadataCache', {})
    const cached = cache[key]
    if (!cached || Date.now() - Number(cached.updatedAt || 0) > CACHE_TTL) return null
    return cached.data || null
  } catch {
    return null
  }
}

async function setCachedMetadata(key, data) {
  try {
    const store = await getStore()
    const cache = store.get('metadataCache', {})
    cache[key] = { updatedAt: Date.now(), data }
    const keys = Object.keys(cache)
    if (keys.length > 700) {
      keys
        .sort((a, b) => Number(cache[a]?.updatedAt || 0) - Number(cache[b]?.updatedAt || 0))
        .slice(0, keys.length - 700)
        .forEach((oldKey) => delete cache[oldKey])
    }
    store.set('metadataCache', cache)
  } catch {
    // Metadata cache is an optimization; enrichment should still work without it.
  }
}

async function searchCinemeta(type, title) {
  const normalizedType = type === 'series' ? 'series' : 'movie'
  const url = `${CINEMETA_BASE_URL}/catalog/${normalizedType}/top/search=${encodeURIComponent(title)}.json`
  const data = await fetchJson(url)
  return Array.isArray(data?.metas) ? data.metas : []
}

async function getCinemetaMeta(type, id) {
  const normalizedType = type === 'series' ? 'series' : 'movie'
  const url = `${CINEMETA_BASE_URL}/meta/${normalizedType}/${id}.json`
  const data = await fetchJson(url)
  return data?.meta || null
}

async function enrichFromCinemeta(base) {
  try {
    const candidates = await searchCinemeta(base.type, base.title)
    const best = candidates
      .map((candidate) => ({ candidate, score: computeScore(candidate, base.title, base.year) }))
      .sort((a, b) => b.score - a.score)[0]

    if (!best?.candidate || best.score < 30) return null

    const meta = await getCinemetaMeta(base.type, best.candidate.imdb_id || best.candidate.id)
    const source = meta || best.candidate
    return {
      poster: cleanText(source.poster || best.candidate.poster || ''),
      synopsis: cleanText(source.description || source.overview || ''),
      genres: Array.isArray(source.genre) ? source.genre.map(cleanText).filter(Boolean) : [],
      duration: cleanText(source.runtime || ''),
      director: Array.isArray(source.director) ? source.director.map(cleanText).filter(Boolean).join(', ') : cleanText(source.director || ''),
      cast: Array.isArray(source.cast) ? source.cast.slice(0, 12).map(cleanText).filter(Boolean) : [],
      rating: ratingFromMeta(source),
      provider: 'cinemeta'
    }
  } catch {
    return null
  }
}

async function enrichSeriesFromTvmaze(base) {
  try {
    const search = await fetchJson(`${TVMAZE_BASE_URL}/search/shows`, { q: base.title })
    const best = (Array.isArray(search) ? search : [])
      .map((entry) => ({ show: entry.show, score: computeScore(entry.show, base.title, base.year) + Number(entry.score || 0) * 10 }))
      .sort((a, b) => b.score - a.score)[0]

    if (!best?.show || best.score < 30) return null

    const show = best.show
    const castData = await fetchJson(`${TVMAZE_BASE_URL}/shows/${show.id}/cast`).catch(() => [])
    return {
      poster: cleanText(show.image?.original || show.image?.medium || ''),
      synopsis: cleanText(show.summary || ''),
      genres: Array.isArray(show.genres) ? show.genres.map(cleanText).filter(Boolean) : [],
      duration: show.averageRuntime ? `${show.averageRuntime} min` : show.runtime ? `${show.runtime} min` : '',
      director: '',
      cast: Array.isArray(castData) ? castData.map((entry) => cleanText(entry?.person?.name)).filter(Boolean).slice(0, 12) : [],
      rating: show.rating?.average ? String(show.rating.average) : '',
      provider: 'tvmaze'
    }
  } catch {
    return null
  }
}

async function enrichBook(base) {
  try {
    const data = await fetchJson(OPEN_LIBRARY_URL, {
      q: base.title,
      limit: 10,
      language: 'spa'
    })
    const docs = Array.isArray(data?.docs) ? data.docs : []
    const best = docs
      .map((doc) => ({ doc, score: computeScore(doc, base.title, base.year) }))
      .sort((a, b) => b.score - a.score)[0]

    if (!best?.doc || best.score < 20) return null

    const coverId = best.doc.cover_i
    return {
      poster: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '',
      synopsis: '',
      genres: Array.isArray(best.doc.subject) ? best.doc.subject.slice(0, 6).map(cleanText).filter(Boolean) : [],
      duration: '',
      director: '',
      cast: Array.isArray(best.doc.author_name) ? best.doc.author_name.slice(0, 4).map(cleanText).filter(Boolean) : [],
      rating: '',
      provider: 'openlibrary'
    }
  } catch {
    return null
  }
}

function wikidataSparqlForEntity(entityId) {
  return `
SELECT ?item ?itemLabel ?article ?image ?imdb ?directorLabel ?castLabel ?genreLabel WHERE {
  VALUES ?item { wd:${entityId} }
  OPTIONAL { ?article schema:about ?item; schema:isPartOf <https://es.wikipedia.org/>. }
  OPTIONAL { ?item wdt:P18 ?image. }
  OPTIONAL { ?item wdt:P345 ?imdb. }
  OPTIONAL { ?item wdt:P57 ?director. }
  OPTIONAL { ?item wdt:P161 ?cast. }
  OPTIONAL { ?item wdt:P136 ?genre. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}
LIMIT 40`
}

async function enrichFromWikidata(base) {
  try {
    const searchData = await fetchJson(WIKIDATA_SEARCH_URL, {
      action: 'wbsearchentities',
      search: base.title,
      language: 'es',
      uselang: 'es',
      format: 'json',
      limit: 8
    })
    const candidates = Array.isArray(searchData?.search) ? searchData.search : []
    const best = candidates
      .map((candidate) => ({ candidate, score: computeScore({ name: candidate.label, year: candidate.description }, base.title, base.year) }))
      .sort((a, b) => b.score - a.score)[0]

    if (!best?.candidate?.id || best.score < 25) return null

    const sparql = await fetchJson(WIKIDATA_SPARQL_URL, {
      query: wikidataSparqlForEntity(best.candidate.id),
      format: 'json'
    }, 12000)
    const rows = Array.isArray(sparql?.results?.bindings) ? sparql.results.bindings : []
    const first = rows[0] || {}
    const article = cleanText(first.article?.value || '')
    const directors = [...new Set(rows.map((row) => cleanText(row.directorLabel?.value)).filter(Boolean))].slice(0, 4)
    const cast = [...new Set(rows.map((row) => cleanText(row.castLabel?.value)).filter(Boolean))].slice(0, 12)
    const genres = [...new Set(rows.map((row) => cleanText(row.genreLabel?.value)).filter(Boolean))].slice(0, 8)
    let synopsis = ''
    let poster = ''

    if (article) {
      const title = decodeURIComponent(article.split('/wiki/')[1] || '').replace(/_/g, ' ')
      const summary = await fetchJson(`${WIKIPEDIA_SUMMARY_BASE}/${encodeURIComponent(title)}`).catch(() => null)
      synopsis = cleanText(summary?.extract || '')
      poster = cleanText(summary?.thumbnail?.source || summary?.originalimage?.source || '')
    }

    if (!poster && first.image?.value) {
      poster = `${COMMONS_FILE_BASE}/${encodeURIComponent(first.image.value.split('/').pop())}`
    }

    return {
      poster,
      synopsis,
      genres,
      duration: '',
      director: directors.join(', '),
      cast,
      rating: '',
      provider: 'wikidata'
    }
  } catch {
    return null
  }
}

async function enrichMetadata(base) {
  const key = metadataCacheKey(base)
  const cached = await getCachedMetadata(key)
  if (cached) return cached

  let result
  if (base.type === 'book') {
    result = mergeMetadata(await enrichBook(base), await enrichFromWikidata(base), EMPTY_METADATA)
  } else if (base.type === 'series') {
    result = mergeMetadata(
      await enrichSeriesFromTvmaze(base),
      await enrichFromCinemeta(base),
      await enrichFromWikidata(base),
      EMPTY_METADATA
    )
  } else {
    result = mergeMetadata(
      await enrichFromCinemeta(base),
      await enrichFromWikidata(base),
      EMPTY_METADATA
    )
  }

  if (hasUsefulMetadata(result)) await setCachedMetadata(key, result)
  return result
}

module.exports = {
  enrichMetadata
}
