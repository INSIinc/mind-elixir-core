// vite.config.ts
import { defineConfig } from 'file:///opt/projects/re-mooc/packages/mind-elixir-core/node_modules/vite/dist/node/index.js'
import cssInjectedByJsPlugin from 'file:///opt/projects/re-mooc/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js'
var vite_config_default = defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  server: {
    host: true,
    port: 23333,
    strictPort: true,
  },
  // build: {
  //   cssCodeSplit: false,
  //   lib: {
  //     // Could also be a dictionary or array of multiple entry points
  //     entry: {
  //       MindElixir: resolve(__dirname, './src/index.ts'),
  //       MindElixirLite: resolve(__dirname, './src/index.lite.ts'),
  //       example1: resolve(__dirname, './src/exampleData/1.ts'),
  //       example2: resolve(__dirname, './src/exampleData/2.ts'),
  //     },
  //     name: 'MindElixir',
  //     // formats: ['es'],
  //   },
  //   rollupOptions: {
  //     // make sure to externalize deps that shouldn't be bundled
  //     // into your library
  //     //   external: ['vue'],
  //     //   output: {
  //     //     // Provide global variables to use in the UMD build
  //     //     // for externalized deps
  //     //     globals: {
  //     //       vue: 'Vue',
  //     //     },
  //     //   },
  //     output: [
  //       {
  //         dir: 'dist',
  //         // file: 'bundle.js',
  //         format: 'iife',
  //         name: 'MyBundle',
  //         inlineDynamicImports: true,
  //       },
  //       {
  //         dir: 'dist',
  //         // file: 'bundle.js',
  //         format: 'es',
  //         name: 'MyBundle',
  //         inlineDynamicImports: true,
  //       },
  //     ],
  //   },
  // },
})
export { vite_config_default as default }
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvb3B0L3Byb2plY3RzL3JlLW1vb2MvcGFja2FnZXMvbWluZC1lbGl4aXItY29yZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL29wdC9wcm9qZWN0cy9yZS1tb29jL3BhY2thZ2VzL21pbmQtZWxpeGlyLWNvcmUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL29wdC9wcm9qZWN0cy9yZS1tb29jL3BhY2thZ2VzL21pbmQtZWxpeGlyLWNvcmUvdml0ZS5jb25maWcudHNcIjsvLyB2aXRlLmNvbmZpZy5qc1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IGNzc0luamVjdGVkQnlKc1BsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1jc3MtaW5qZWN0ZWQtYnktanMnXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbY3NzSW5qZWN0ZWRCeUpzUGx1Z2luKCldLFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiB0cnVlLFxuICAgIHBvcnQ6IDIzMzMzLFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gIH0sXG4gIC8vIGJ1aWxkOiB7XG4gIC8vICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcbiAgLy8gICBsaWI6IHtcbiAgLy8gICAgIC8vIENvdWxkIGFsc28gYmUgYSBkaWN0aW9uYXJ5IG9yIGFycmF5IG9mIG11bHRpcGxlIGVudHJ5IHBvaW50c1xuICAvLyAgICAgZW50cnk6IHtcbiAgLy8gICAgICAgTWluZEVsaXhpcjogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9pbmRleC50cycpLFxuICAvLyAgICAgICBNaW5kRWxpeGlyTGl0ZTogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9pbmRleC5saXRlLnRzJyksXG4gIC8vICAgICAgIGV4YW1wbGUxOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2V4YW1wbGVEYXRhLzEudHMnKSxcbiAgLy8gICAgICAgZXhhbXBsZTI6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvZXhhbXBsZURhdGEvMi50cycpLFxuICAvLyAgICAgfSxcbiAgLy8gICAgIG5hbWU6ICdNaW5kRWxpeGlyJyxcbiAgLy8gICAgIC8vIGZvcm1hdHM6IFsnZXMnXSxcbiAgLy8gICB9LFxuICAvLyAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgLy8gICAgIC8vIG1ha2Ugc3VyZSB0byBleHRlcm5hbGl6ZSBkZXBzIHRoYXQgc2hvdWxkbid0IGJlIGJ1bmRsZWRcbiAgLy8gICAgIC8vIGludG8geW91ciBsaWJyYXJ5XG4gIC8vICAgICAvLyAgIGV4dGVybmFsOiBbJ3Z1ZSddLFxuICAvLyAgICAgLy8gICBvdXRwdXQ6IHtcbiAgLy8gICAgIC8vICAgICAvLyBQcm92aWRlIGdsb2JhbCB2YXJpYWJsZXMgdG8gdXNlIGluIHRoZSBVTUQgYnVpbGRcbiAgLy8gICAgIC8vICAgICAvLyBmb3IgZXh0ZXJuYWxpemVkIGRlcHNcbiAgLy8gICAgIC8vICAgICBnbG9iYWxzOiB7XG4gIC8vICAgICAvLyAgICAgICB2dWU6ICdWdWUnLFxuICAvLyAgICAgLy8gICAgIH0sXG4gIC8vICAgICAvLyAgIH0sXG4gIC8vICAgICBvdXRwdXQ6IFtcbiAgLy8gICAgICAge1xuICAvLyAgICAgICAgIGRpcjogJ2Rpc3QnLFxuICAvLyAgICAgICAgIC8vIGZpbGU6ICdidW5kbGUuanMnLFxuICAvLyAgICAgICAgIGZvcm1hdDogJ2lpZmUnLFxuICAvLyAgICAgICAgIG5hbWU6ICdNeUJ1bmRsZScsXG4gIC8vICAgICAgICAgaW5saW5lRHluYW1pY0ltcG9ydHM6IHRydWUsXG4gIC8vICAgICAgIH0sXG4gIC8vICAgICAgIHtcbiAgLy8gICAgICAgICBkaXI6ICdkaXN0JyxcbiAgLy8gICAgICAgICAvLyBmaWxlOiAnYnVuZGxlLmpzJyxcbiAgLy8gICAgICAgICBmb3JtYXQ6ICdlcycsXG4gIC8vICAgICAgICAgbmFtZTogJ015QnVuZGxlJyxcbiAgLy8gICAgICAgICBpbmxpbmVEeW5hbWljSW1wb3J0czogdHJ1ZSxcbiAgLy8gICAgICAgfSxcbiAgLy8gICAgIF0sXG4gIC8vICAgfSxcbiAgLy8gfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUEsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTywyQkFBMkI7QUFDbEMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLHNCQUFzQixDQUFDO0FBQUEsRUFDakMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUEyQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
