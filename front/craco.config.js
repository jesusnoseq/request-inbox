module.exports = {
    reactScriptsVersion: "react-scripts" /* (default value) */,
    webpack: {
        mode: 'extends',
        configure: {
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        enforce: "pre",
                        use: ["source-map-loader"],
                    },
                ],
            },
            ignoreWarnings: [/Failed to parse source map/],
        },
    },
    devServer: (devServerConfig) => {
        const { onBeforeSetupMiddleware, onAfterSetupMiddleware } = devServerConfig;

        devServerConfig.setupMiddlewares = (middlewares, devServer) => {
            onBeforeSetupMiddleware?.(devServer);

            if (onAfterSetupMiddleware) {
                const app = devServer.app;

                // CRA's after hook only registers middleware; collect it at the end of the stack.
                devServer.app = {
                    use: (middleware) => middlewares.push(middleware),
                };

                try {
                    onAfterSetupMiddleware(devServer);
                } finally {
                    devServer.app = app;
                }
            }

            return middlewares;
        };

        delete devServerConfig.onBeforeSetupMiddleware;
        delete devServerConfig.onAfterSetupMiddleware;

        return devServerConfig;
    },
    jest: {
        configure: {
            moduleNameMapper: {
                '^react-router/dom$': '<rootDir>/node_modules/react-router/dist/development/dom-export.js',
                '^@uiw/react-json-view/(light|dark)$': '<rootDir>/node_modules/@uiw/react-json-view/cjs/theme/$1.js',
                '^#swagger-ui$': '<rootDir>/node_modules/swagger-ui-react/swagger-ui-es-bundle.js',
            },
        },
    },
}
