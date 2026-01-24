// vite.config.js
import { defineConfig, loadEnv } from "file:///C:/Project/nurseryseva/node_modules/vite/dist/node/index.js";
import laravel from "file:///C:/Project/nurseryseva/node_modules/laravel-vite-plugin/dist/index.js";
import react from "file:///C:/Project/nurseryseva/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "node:path";
import autoprefixer from "file:///C:/Project/nurseryseva/node_modules/autoprefixer/lib/autoprefixer.js";
import { VitePWA } from "file:///C:/Project/nurseryseva/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "C:\\Project\\nurseryseva";
var vite_config_default = defineConfig(({ mode }) => {
  const manifestIcons = [
    {
      "src": "/manifest-icon-192.maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/manifest-icon-192.maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/manifest-icon-512.maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/manifest-icon-512.maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ];
  const publicIcons = [
    { src: "/favicon.ico" },
    { src: "/favicon.svg" },
    { src: "/apple-touch-icon-180.png" }
  ];
  const additionalImages = [];
  return {
    base: "./",
    // build: {
    //   outDir: 'build',
    // },
    css: {
      postcss: {
        plugins: [
          autoprefixer({})
          // add options if needed
        ]
      }
    },
    esbuild: {
      loader: "jsx",
      include: /react\/.*\.jsx?$/,
      exclude: []
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          ".js": "jsx"
        }
      }
    },
    plugins: [
      laravel({
        input: ["resources/react/index.js"],
        refresh: true
      }),
      react(),
      VitePWA({
        // Make the PWA plugin build to the same place as laravel/vite-plugin
        buildBase: "/build/",
        // Define the scope and the base so that the PWA can run from the
        // root of the domain, even though the files live in /build.
        // This requires the service worker to be served with
        // a header `Service-Worker-Allowed: /` to authorise it.
        // @see server.php
        scope: "/build/",
        base: "/",
        // Use 'prompt' for new versions of the PWA. 'autoUpdate' is
        // simpler but may as well dmeo how this works.
        registerType: "prompt",
        // Do not use the PWA with dev builds.
        devOptions: {
          enabled: false
        },
        // The Vite PWA docs suggest you should use includeAssets for
        // icons that are not in the manifest. But laravel/vite-plugin
        // does not use a public dir in the build - it relies on
        // Laravel's. If we add this as a publicDir to vite's config
        // then vite-plugin-pwa finds everything in public (eg if you are
        // using telescope then all its assets get cached). It then adds
        // these assets to the service worker with the `/build` prefix,
        // which doesn't work. I found it easiest to leave this empty
        // and use `additionalManifestEntries` below.
        includeAssets: [],
        workbox: {
          // Add all the assets built by Vite into the public/build/assets
          // folder to the SW cache.
          globPatterns: ["**/*.{js,css,html,ico,jpg,png,svg,woff,woff2,ttf,eot}"],
          // Define the root URL as the entrypoint for the offline app.
          // vue-router can then takes over and shows the correct page
          // if you are using it.
          navigateFallback: "/",
          // Stops various paths being intercepted by the service worker
          // if they're not available offline. Telescope is a good
          // example, if you are using that.
          navigateFallbackDenylist: [/^\/telescope/],
          // Add some explicit URLs to the SW precache. This helps us
          // work with the laravel/vite-plugin setup.
          additionalManifestEntries: [
            // Cache the root URL to get hold of the PWA HTML entrypoint
            // defined in welcome.blade.php. Ref:
            // https://github.com/vite-pwa/vite-plugin-pwa/issues/431#issuecomment-1703151065
            { url: "/", revision: `${Date.now()}` },
            // Cache the icons defined above for the manifest
            ...manifestIcons.map((i) => {
              return { url: i.src, revision: `${Date.now()}` };
            }),
            // Cache the other offline icons defined above
            ...publicIcons.map((i) => {
              return { url: i.src, revision: `${Date.now()}` };
            }),
            // Cache any additional images defined above
            ...additionalImages.map((i) => {
              return { url: i.src, revision: `${Date.now()}` };
            })
          ],
          // Ensure the JS build does not get dropped from the cache.
          // This allows it to be as big as 3MB
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
        },
        // Manifest settings - these will appear in the generated manifest.webmanifest
        manifest: {
          name: "Nursery Seva",
          short_name: "Nursery Seva",
          description: "An app to Nursery Seva.",
          theme_color: "#171717",
          background_color: "#e8ebf2",
          display: "standalone",
          scope: "/",
          start_url: "/",
          orientation: "portrait",
          icons: [...manifestIcons]
        }
      })
    ],
    resolve: {
      alias: [
        {
          find: "resources/react/",
          replacement: `${path.resolve(__vite_injected_original_dirname, "resources/react")}/`
        }
      ],
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".scss"]
    },
    server: {
      port: 3001,
      proxy: {
        // https://vitejs.dev/config/server-options.html
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxQcm9qZWN0XFxcXG51cnNlcnlzZXZhXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxQcm9qZWN0XFxcXG51cnNlcnlzZXZhXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Qcm9qZWN0L251cnNlcnlzZXZhL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCBsYXJhdmVsIGZyb20gJ2xhcmF2ZWwtdml0ZS1wbHVnaW4nXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnXG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcidcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCJcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBtYW5pZmVzdEljb25zID0gW1xuICAgIHtcbiAgICAgIFwic3JjXCI6IFwiL21hbmlmZXN0LWljb24tMTkyLm1hc2thYmxlLnBuZ1wiLFxuICAgICAgXCJzaXplc1wiOiBcIjE5MngxOTJcIixcbiAgICAgIFwidHlwZVwiOiBcImltYWdlL3BuZ1wiLFxuICAgICAgXCJwdXJwb3NlXCI6IFwiYW55XCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwic3JjXCI6IFwiL21hbmlmZXN0LWljb24tMTkyLm1hc2thYmxlLnBuZ1wiLFxuICAgICAgXCJzaXplc1wiOiBcIjE5MngxOTJcIixcbiAgICAgIFwidHlwZVwiOiBcImltYWdlL3BuZ1wiLFxuICAgICAgXCJwdXJwb3NlXCI6IFwibWFza2FibGVcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJzcmNcIjogXCIvbWFuaWZlc3QtaWNvbi01MTIubWFza2FibGUucG5nXCIsXG4gICAgICBcInNpemVzXCI6IFwiNTEyeDUxMlwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICBcInB1cnBvc2VcIjogXCJhbnlcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJzcmNcIjogXCIvbWFuaWZlc3QtaWNvbi01MTIubWFza2FibGUucG5nXCIsXG4gICAgICBcInNpemVzXCI6IFwiNTEyeDUxMlwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICBcInB1cnBvc2VcIjogXCJtYXNrYWJsZVwiXG4gICAgfVxuICBdO1xuXG4gIGNvbnN0IHB1YmxpY0ljb25zID0gW1xuICAgIHsgc3JjOiAnL2Zhdmljb24uaWNvJyB9LFxuICAgIHsgc3JjOiAnL2Zhdmljb24uc3ZnJyB9LFxuICAgIHsgc3JjOiAnL2FwcGxlLXRvdWNoLWljb24tMTgwLnBuZycgfVxuICBdO1xuXG4gIGNvbnN0IGFkZGl0aW9uYWxJbWFnZXMgPSBbXTtcblxuICByZXR1cm4ge1xuICAgIGJhc2U6ICcuLycsXG4gICAgLy8gYnVpbGQ6IHtcbiAgICAvLyAgIG91dERpcjogJ2J1aWxkJyxcbiAgICAvLyB9LFxuICAgIGNzczoge1xuICAgICAgcG9zdGNzczoge1xuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgYXV0b3ByZWZpeGVyKHt9KSwgLy8gYWRkIG9wdGlvbnMgaWYgbmVlZGVkXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZXNidWlsZDoge1xuICAgICAgbG9hZGVyOiAnanN4JyxcbiAgICAgIGluY2x1ZGU6IC9yZWFjdFxcLy4qXFwuanN4PyQvLFxuICAgICAgZXhjbHVkZTogW10sXG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGZvcmNlOiB0cnVlLFxuICAgICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgICAgbG9hZGVyOiB7XG4gICAgICAgICAgJy5qcyc6ICdqc3gnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIGxhcmF2ZWwoe1xuICAgICAgICBpbnB1dDogWydyZXNvdXJjZXMvcmVhY3QvaW5kZXguanMnXSxcbiAgICAgICAgcmVmcmVzaDogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAgcmVhY3QoKSxcbiAgICAgIFZpdGVQV0Eoe1xuICAgICAgICAvLyBNYWtlIHRoZSBQV0EgcGx1Z2luIGJ1aWxkIHRvIHRoZSBzYW1lIHBsYWNlIGFzIGxhcmF2ZWwvdml0ZS1wbHVnaW5cbiAgICAgICAgYnVpbGRCYXNlOiAnL2J1aWxkLycsXG5cbiAgICAgICAgLy8gRGVmaW5lIHRoZSBzY29wZSBhbmQgdGhlIGJhc2Ugc28gdGhhdCB0aGUgUFdBIGNhbiBydW4gZnJvbSB0aGVcbiAgICAgICAgLy8gcm9vdCBvZiB0aGUgZG9tYWluLCBldmVuIHRob3VnaCB0aGUgZmlsZXMgbGl2ZSBpbiAvYnVpbGQuXG4gICAgICAgIC8vIFRoaXMgcmVxdWlyZXMgdGhlIHNlcnZpY2Ugd29ya2VyIHRvIGJlIHNlcnZlZCB3aXRoXG4gICAgICAgIC8vIGEgaGVhZGVyIGBTZXJ2aWNlLVdvcmtlci1BbGxvd2VkOiAvYCB0byBhdXRob3Jpc2UgaXQuXG4gICAgICAgIC8vIEBzZWUgc2VydmVyLnBocFxuICAgICAgICBzY29wZTogJy9idWlsZC8nLFxuICAgICAgICBiYXNlOiAnLycsXG5cbiAgICAgICAgLy8gVXNlICdwcm9tcHQnIGZvciBuZXcgdmVyc2lvbnMgb2YgdGhlIFBXQS4gJ2F1dG9VcGRhdGUnIGlzXG4gICAgICAgIC8vIHNpbXBsZXIgYnV0IG1heSBhcyB3ZWxsIGRtZW8gaG93IHRoaXMgd29ya3MuXG4gICAgICAgIHJlZ2lzdGVyVHlwZTogJ3Byb21wdCcsXG5cbiAgICAgICAgLy8gRG8gbm90IHVzZSB0aGUgUFdBIHdpdGggZGV2IGJ1aWxkcy5cbiAgICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICAgICAgZW5hYmxlZDogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGUgVml0ZSBQV0EgZG9jcyBzdWdnZXN0IHlvdSBzaG91bGQgdXNlIGluY2x1ZGVBc3NldHMgZm9yXG4gICAgICAgIC8vIGljb25zIHRoYXQgYXJlIG5vdCBpbiB0aGUgbWFuaWZlc3QuIEJ1dCBsYXJhdmVsL3ZpdGUtcGx1Z2luXG4gICAgICAgIC8vIGRvZXMgbm90IHVzZSBhIHB1YmxpYyBkaXIgaW4gdGhlIGJ1aWxkIC0gaXQgcmVsaWVzIG9uXG4gICAgICAgIC8vIExhcmF2ZWwncy4gSWYgd2UgYWRkIHRoaXMgYXMgYSBwdWJsaWNEaXIgdG8gdml0ZSdzIGNvbmZpZ1xuICAgICAgICAvLyB0aGVuIHZpdGUtcGx1Z2luLXB3YSBmaW5kcyBldmVyeXRoaW5nIGluIHB1YmxpYyAoZWcgaWYgeW91IGFyZVxuICAgICAgICAvLyB1c2luZyB0ZWxlc2NvcGUgdGhlbiBhbGwgaXRzIGFzc2V0cyBnZXQgY2FjaGVkKS4gSXQgdGhlbiBhZGRzXG4gICAgICAgIC8vIHRoZXNlIGFzc2V0cyB0byB0aGUgc2VydmljZSB3b3JrZXIgd2l0aCB0aGUgYC9idWlsZGAgcHJlZml4LFxuICAgICAgICAvLyB3aGljaCBkb2Vzbid0IHdvcmsuIEkgZm91bmQgaXQgZWFzaWVzdCB0byBsZWF2ZSB0aGlzIGVtcHR5XG4gICAgICAgIC8vIGFuZCB1c2UgYGFkZGl0aW9uYWxNYW5pZmVzdEVudHJpZXNgIGJlbG93LlxuICAgICAgICBpbmNsdWRlQXNzZXRzOiBbXSxcblxuICAgICAgICB3b3JrYm94OiB7XG4gICAgICAgICAgICAvLyBBZGQgYWxsIHRoZSBhc3NldHMgYnVpbHQgYnkgVml0ZSBpbnRvIHRoZSBwdWJsaWMvYnVpbGQvYXNzZXRzXG4gICAgICAgICAgICAvLyBmb2xkZXIgdG8gdGhlIFNXIGNhY2hlLlxuICAgICAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxqcGcscG5nLHN2Zyx3b2ZmLHdvZmYyLHR0Zixlb3R9J10sXG5cbiAgICAgICAgICAgIC8vIERlZmluZSB0aGUgcm9vdCBVUkwgYXMgdGhlIGVudHJ5cG9pbnQgZm9yIHRoZSBvZmZsaW5lIGFwcC5cbiAgICAgICAgICAgIC8vIHZ1ZS1yb3V0ZXIgY2FuIHRoZW4gdGFrZXMgb3ZlciBhbmQgc2hvd3MgdGhlIGNvcnJlY3QgcGFnZVxuICAgICAgICAgICAgLy8gaWYgeW91IGFyZSB1c2luZyBpdC5cbiAgICAgICAgICAgIG5hdmlnYXRlRmFsbGJhY2s6ICcvJyxcblxuICAgICAgICAgICAgLy8gU3RvcHMgdmFyaW91cyBwYXRocyBiZWluZyBpbnRlcmNlcHRlZCBieSB0aGUgc2VydmljZSB3b3JrZXJcbiAgICAgICAgICAgIC8vIGlmIHRoZXkncmUgbm90IGF2YWlsYWJsZSBvZmZsaW5lLiBUZWxlc2NvcGUgaXMgYSBnb29kXG4gICAgICAgICAgICAvLyBleGFtcGxlLCBpZiB5b3UgYXJlIHVzaW5nIHRoYXQuXG4gICAgICAgICAgICBuYXZpZ2F0ZUZhbGxiYWNrRGVueWxpc3Q6IFsvXlxcL3RlbGVzY29wZS9dLFxuXG4gICAgICAgICAgICAvLyBBZGQgc29tZSBleHBsaWNpdCBVUkxzIHRvIHRoZSBTVyBwcmVjYWNoZS4gVGhpcyBoZWxwcyB1c1xuICAgICAgICAgICAgLy8gd29yayB3aXRoIHRoZSBsYXJhdmVsL3ZpdGUtcGx1Z2luIHNldHVwLlxuICAgICAgICAgICAgYWRkaXRpb25hbE1hbmlmZXN0RW50cmllczogW1xuICAgICAgICAgICAgICAgIC8vIENhY2hlIHRoZSByb290IFVSTCB0byBnZXQgaG9sZCBvZiB0aGUgUFdBIEhUTUwgZW50cnlwb2ludFxuICAgICAgICAgICAgICAgIC8vIGRlZmluZWQgaW4gd2VsY29tZS5ibGFkZS5waHAuIFJlZjpcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdml0ZS1wd2Evdml0ZS1wbHVnaW4tcHdhL2lzc3Vlcy80MzEjaXNzdWVjb21tZW50LTE3MDMxNTEwNjVcbiAgICAgICAgICAgICAgICB7IHVybDogJy8nLCByZXZpc2lvbjogYCR7RGF0ZS5ub3coKX1gIH0sXG5cbiAgICAgICAgICAgICAgICAvLyBDYWNoZSB0aGUgaWNvbnMgZGVmaW5lZCBhYm92ZSBmb3IgdGhlIG1hbmlmZXN0XG4gICAgICAgICAgICAgICAgLi4ubWFuaWZlc3RJY29ucy5tYXAoKGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdXJsOiBpLnNyYywgcmV2aXNpb246IGAke0RhdGUubm93KCl9YCB9XG4gICAgICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgICAgICAvLyBDYWNoZSB0aGUgb3RoZXIgb2ZmbGluZSBpY29ucyBkZWZpbmVkIGFib3ZlXG4gICAgICAgICAgICAgICAgLi4ucHVibGljSWNvbnMubWFwKChpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHVybDogaS5zcmMsIHJldmlzaW9uOiBgJHtEYXRlLm5vdygpfWAgfVxuICAgICAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICAgICAgLy8gQ2FjaGUgYW55IGFkZGl0aW9uYWwgaW1hZ2VzIGRlZmluZWQgYWJvdmVcbiAgICAgICAgICAgICAgICAuLi5hZGRpdGlvbmFsSW1hZ2VzLm1hcCgoaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB1cmw6IGkuc3JjLCByZXZpc2lvbjogYCR7RGF0ZS5ub3coKX1gIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSxcblxuICAgICAgICAgICAgLy8gRW5zdXJlIHRoZSBKUyBidWlsZCBkb2VzIG5vdCBnZXQgZHJvcHBlZCBmcm9tIHRoZSBjYWNoZS5cbiAgICAgICAgICAgIC8vIFRoaXMgYWxsb3dzIGl0IHRvIGJlIGFzIGJpZyBhcyAzTUJcbiAgICAgICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA1ICogMTAyNCAqIDEwMjQsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIE1hbmlmZXN0IHNldHRpbmdzIC0gdGhlc2Ugd2lsbCBhcHBlYXIgaW4gdGhlIGdlbmVyYXRlZCBtYW5pZmVzdC53ZWJtYW5pZmVzdFxuICAgICAgICBtYW5pZmVzdDoge1xuICAgICAgICAgIG5hbWU6IFwiTnVyc2VyeSBTZXZhXCIsXG4gICAgICAgICAgc2hvcnRfbmFtZTogXCJOdXJzZXJ5IFNldmFcIixcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJBbiBhcHAgdG8gTnVyc2VyeSBTZXZhLlwiLFxuICAgICAgICAgIHRoZW1lX2NvbG9yOiBcIiMxNzE3MTdcIixcbiAgICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiBcIiNlOGViZjJcIixcbiAgICAgICAgICBkaXNwbGF5OiBcInN0YW5kYWxvbmVcIixcbiAgICAgICAgICBzY29wZTogXCIvXCIsXG4gICAgICAgICAgc3RhcnRfdXJsOiBcIi9cIixcbiAgICAgICAgICBvcmllbnRhdGlvbjogXCJwb3J0cmFpdFwiLFxuICAgICAgICAgIGljb25zOiBbLi4ubWFuaWZlc3RJY29uc11cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBmaW5kOiAncmVzb3VyY2VzL3JlYWN0LycsXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdyZXNvdXJjZXMvcmVhY3QnKX0vYCxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBleHRlbnNpb25zOiBbJy5tanMnLCAnLmpzJywgJy50cycsICcuanN4JywgJy50c3gnLCAnLmpzb24nLCAnLnNjc3MnXSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMzAwMSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgIC8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvc2VydmVyLW9wdGlvbnMuaHRtbFxuICAgICAgfSxcbiAgICB9LFxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUCxTQUFTLGNBQWMsZUFBZTtBQUNoUyxPQUFPLGFBQWE7QUFDcEIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGtCQUFrQjtBQUN6QixTQUFTLGVBQWU7QUFMeEIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxnQkFBZ0I7QUFBQSxJQUNwQjtBQUFBLE1BQ0UsT0FBTztBQUFBLE1BQ1AsU0FBUztBQUFBLE1BQ1QsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFPO0FBQUEsTUFDUCxTQUFTO0FBQUEsTUFDVCxRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsSUFDYjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQU87QUFBQSxNQUNQLFNBQVM7QUFBQSxNQUNULFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxJQUNiO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBTztBQUFBLE1BQ1AsU0FBUztBQUFBLE1BQ1QsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLElBQ2I7QUFBQSxFQUNGO0FBRUEsUUFBTSxjQUFjO0FBQUEsSUFDbEIsRUFBRSxLQUFLLGVBQWU7QUFBQSxJQUN0QixFQUFFLEtBQUssZUFBZTtBQUFBLElBQ3RCLEVBQUUsS0FBSyw0QkFBNEI7QUFBQSxFQUNyQztBQUVBLFFBQU0sbUJBQW1CLENBQUM7QUFFMUIsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSU4sS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ1AsU0FBUztBQUFBLFVBQ1AsYUFBYSxDQUFDLENBQUM7QUFBQTtBQUFBLFFBQ2pCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJ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
