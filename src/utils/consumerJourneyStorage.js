const POST_RESULTS_KEY = 'wenando-post-results-journey-complete'
const DASHBOARD_GUIDE_KEY = 'wenando-consumer-dashboard-guide-complete'

function readFlag(key) {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeFlag(key) {
  try {
    localStorage.setItem(key, '1')
  } catch {
    /* ignore quota / private mode */
  }
}

export function isPostResultsJourneyComplete() {
  return readFlag(POST_RESULTS_KEY)
}

export function markPostResultsJourneyComplete() {
  writeFlag(POST_RESULTS_KEY)
}

export function isDashboardGuideComplete() {
  return readFlag(DASHBOARD_GUIDE_KEY)
}

export function markDashboardGuideComplete() {
  writeFlag(DASHBOARD_GUIDE_KEY)
}

export function resetConsumerJourneyFlags() {
  try {
    localStorage.removeItem(POST_RESULTS_KEY)
    localStorage.removeItem(DASHBOARD_GUIDE_KEY)
  } catch {
    /* ignore */
  }
}
