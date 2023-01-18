import path from "node:path";
import fse from "fs-extra";
import svgstore from "svgstore";
import glob from "glob";
import prettier from "prettier";

let HEROICONS_PATH = path.join(process.cwd(), "node_modules/heroicons");

let OUTFILE = path.join(process.cwd(), "app/icons/heroicons.svg");
let COMPONENT_FILE = path.join(process.cwd(), "app/components/heroicons.tsx");

let js = String.raw;

async function createSprite(inputDir, outFile) {
  let icons = glob.sync(`${inputDir}/**/*.svg`);

  let sprites = svgstore();
  let union = [];

  for (let icon of icons) {
    let dir = path.dirname(icon);
    let type = path.basename(dir);
    let iconName = path.basename(icon, ".svg");
    let size = path.basename(path.dirname(dir));
    let content = await fse.readFile(icon, "utf-8");
    let name = `${type}:${size}:${iconName}`;
    sprites.add(name, content);
    union.push(name);
  }

  let component = js`
    import iconsHref from "~/icons/heroicons.svg";

    export type SpriteName = ${[...union]
      .map((icon) => `"${icon}"`)
      .join(" | ")};

    export type SpriteProps = { name: SpriteName; } & JSX.IntrinsicElements["svg"];

    export function Svg({ name, ...svgProps }: SpriteProps) {
      return (
        <svg {...svgProps}>
          <use href={iconsHref + "#" + name} />
        </svg>
      );
    }
  `;

  await Promise.all([
    fse.writeFile(outFile, sprites.toString()),
    fse.writeFile(
      COMPONENT_FILE,
      prettier.format(component, { parser: "typescript" })
    ),
  ]);
}

async function compile() {
  await fse.ensureDir(path.dirname(OUTFILE));
  await createSprite(HEROICONS_PATH, OUTFILE);
}

compile();
