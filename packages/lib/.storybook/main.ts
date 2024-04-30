import type { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig } from 'vite';
import * as path from 'path';
import eslint from '@rollup/plugin-eslint';
import stylelint from 'vite-plugin-stylelint';
import generateEnvironmentVariables from '../config/environment-variables';

const config: StorybookConfig = {
    stories: ['../storybook/**/*.stories.@(js|jsx|ts|tsx)'],

    addons: [
        {
            name: '@storybook/addon-essentials',
            options: {
                docs: false
            }
        },
        {
            name: '@storybook/addon-a11y'
        }
    ],

    framework: {
        name: getAbsolutePath('@storybook/preact-vite'),
        options: {}
    },

    staticDirs: ['../storybook/assets'],

    async viteFinal(config) {
        return mergeConfig(config, {
            define: generateEnvironmentVariables(),
            resolve: {
                alias: [
                    {
                        // this is required for the SCSS modules
                        find: /^~(.*)$/,
                        replacement: '$1'
                    }
                ]
            },
            server: {
                watch: {
                    usePolling: true
                }
            },
            plugins: [
                stylelint(),
                {
                    ...eslint({
                        include: ['./src/**'],
                        exclude: ['./src/**/*.json', './src/**/*.scss']
                    }),
                    enforce: 'pre',
                    apply: 'serve'
                }
            ]
        });
    }
};
export default config;

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
    return path.dirname(require.resolve(path.join(value, 'package.json')));
}
