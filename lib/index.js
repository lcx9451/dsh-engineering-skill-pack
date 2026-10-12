import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

export const name = 'dsh-engineering-skill-pack';
export const PACKAGE_NAME = 'dsh-engineering-skill-pack';

/**
 * 解析随包技能根目录：从 DSH profile 的 baseUrl 出发解析本包清单，
 * 再取其同级的 skills/。cordis.patch.yml 里的 bundledSkillDir 用的是同一套逻辑。
 */
export function resolveSkillRoot(profileBaseUrl) {
  if (!profileBaseUrl) {
    throw new Error(`${PACKAGE_NAME}: missing DSH profile baseUrl for package resolution`);
  }
  let manifestPath;
  try {
    manifestPath = createRequire(profileBaseUrl).resolve(`${PACKAGE_NAME}/package.json`);
  } catch (error) {
    throw new Error(
      `${PACKAGE_NAME}: cannot resolve ${PACKAGE_NAME}/package.json from the DSH profile`,
      { cause: error },
    );
  }
  return join(dirname(manifestPath), 'skills');
}
