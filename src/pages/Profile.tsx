import { Dossier, EmptyDossiers } from './Dossier'
import { dossierProject, listSlugs } from '../lib/dossiers'
import { hashParams } from '../routes'

/* Hồ sơ của tôi = the dossier desk inside the site. One folder per project; the cabinet lists them all.
 * "#/ho-so?prj=<slug>" opens that folder (creating it if new); without it, the first folder you have. */
export function Profile() {
  const prj = hashParams().get('prj')
  const slug = prj && dossierProject(prj) ? prj : listSlugs()[0]
  return (
    <main id="noi-dung" tabIndex={-1} className="w-full outline-none">
      <h1 className="sr-only">Hồ sơ của tôi</h1>
      {slug ? <Dossier slug={slug} embedded /> : <EmptyDossiers />}
    </main>
  )
}
