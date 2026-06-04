/**
 * Build a GeoJSON polygon approximating a circle on the Earth's surface.
 */
export function createCircleGeoJSON(centerLng, centerLat, radiusKm, pointCount = 64) {
  const coords = []
  const earthRadiusKm = 6371
  const angularDistance = radiusKm / earthRadiusKm
  const centerLatRad = (centerLat * Math.PI) / 180
  const centerLngRad = (centerLng * Math.PI) / 180

  for (let i = 0; i <= pointCount; i += 1) {
    const bearing = (i / pointCount) * 2 * Math.PI
    const latRad = Math.asin(
      Math.sin(centerLatRad) * Math.cos(angularDistance) +
        Math.cos(centerLatRad) * Math.sin(angularDistance) * Math.cos(bearing),
    )
    const lngRad =
      centerLngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(centerLatRad),
        Math.cos(angularDistance) - Math.sin(centerLatRad) * Math.sin(latRad),
      )
    coords.push([(lngRad * 180) / Math.PI, (latRad * 180) / Math.PI])
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
    properties: {},
  }
}

export function createCenterPointGeoJSON(centerLng, centerLat) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [centerLng, centerLat],
    },
    properties: {},
  }
}

export function fitMapToCircle(map, centerLng, centerLat, radiusKm) {
  if (!map) return

  const circle = createCircleGeoJSON(centerLng, centerLat, radiusKm)
  const lngs = circle.geometry.coordinates[0].map((coord) => coord[0])
  const lats = circle.geometry.coordinates[0].map((coord) => coord[1])

  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding: 48, maxZoom: 12, duration: 600 },
  )
}
