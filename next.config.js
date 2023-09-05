/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
    experimental: {
        serverActions: true,
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Note: We provide webpack as an argument to the function
        // You should not require() webpack outside of this function.
    
        // Define an environment variable
        config.plugins.push(
          new webpack.DefinePlugin({
            'process.env.FLUENTFFMPEG_COV': JSON.stringify(false),
          })
        );
    
        return config;
      },
}

 


module.exports = nextConfig
