/** @param {{ publicRef?: string, leadUuid?: string, id?: string|number }} search */
export function searchDetailPath(search) {
  const ref = search?.publicRef ?? search?.leadUuid ?? search?.id
  return ref ? `/area-personale/ricerche/${ref}` : '/area-personale/ricerche'
}
