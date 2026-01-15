import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";

const packageJson = require('./package.json');
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default [
    {
        input: 'index.ts',
        output: [
            {
                file: packageJson.main,
                format: "cjs",
                sourcemap: true,
            },
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: true,
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve({ extensions }),
            
            // --- THE FIX IS HERE ---
            typescript({ 
                // 1. Point to the actual app config, not the empty "references" file
                tsconfig: './tsconfig.app.json',
                
                // 2. Override "noEmit" so Rollup actually generates code
                compilerOptions: {
                    noEmit: false, 
                    emitDeclarationOnly: false 
                },
                
                // 3. Explicitly include your root index and source files
                include: ["src/**/*", "index.ts"] 
            }),
            // -----------------------

            commonjs(),
            terser(),
            postcss()
        ],
        external: ["react", "react-dom"],
    },
    {
        input: 'index.ts',
        output: [{ file: packageJson.types }],
        plugins: [
            dts.default({
                // Point dts to the same config to find types correctly
                tsconfig: './tsconfig.app.json' 
            })
        ],
        external: [/\.css$/],
    },
];