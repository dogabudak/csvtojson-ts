import typescript from "rollup-plugin-typescript2";
import { builtinModules } from "module";
import { dependencies, devDependencies } from "./package.json";
import glob from "glob";
import cleanup from "rollup-plugin-cleanup";
import prettier from "rollup-plugin-prettier";
import { terser } from "rollup-plugin-terser";

import prettierConfig from "./.prettierrc.json";

/** @type {import('rollup').RollupOptions} */
const config = {
  input: [...glob.sync("./src/index.ts")],
  external: [
    ...builtinModules,
    ...Object.keys({ ...devDependencies, ...dependencies })
  ],
  output: [
    {
      dir: "./dist/cjs",
      format: "commonjs",
      exports: "named",
      preserveModules: true,
      entryFileNames: "[name].js",
      compact: true,
      generatedCode: {
        constBindings: true,
        arrowFunctions: true,
        objectShorthand: true
      },
      externalLiveBindings: false,
      minifyInternalExports: true
    },
    {
      dir: "./dist/esm",
      format: "module",
      exports: "named",
      preserveModules: true,
      entryFileNames: "[name].mjs",
      compact: true,
      generatedCode: {
        constBindings: true,
        arrowFunctions: true,
        objectShorthand: true
      },
      externalLiveBindings: false,
      minifyInternalExports: true
    },
    {
      dir: "./dist/browser",
      format: "module",
      preserveModules: true,
      entryFileNames: "[name].mjs",
      compact: true,
      generatedCode: {
        constBindings: true,
        arrowFunctions: true,
        objectShorthand: true
      },
      externalLiveBindings: false,
      minifyInternalExports: true,
      plugins: [terser({ compress: true, module: true })]
    }
  ],
  treeshake: {
    unknownGlobalSideEffects: false,
    moduleSideEffects: false,
    correctVarValueBeforeDeclaration: false,
    preset: "smallest",
    annotations: false,
    propertyReadSideEffects: false
  },
  plugins: [
    typescript({
      tsconfig: "./tsconfig.build.json",
      useTsconfigDeclarationDir: true
    }),
    cleanup({
      extensions: ["js", "ts", "mjs"],
      comments: ["jsdoc"],
      compactComments: true
    }),
    prettier({
      ...prettierConfig,
      parser: "babel-ts"
    })
  ]
};

export default config;
