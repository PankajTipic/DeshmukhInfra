// vite.config.js
import { defineConfig, loadEnv } from "file:///E:/Samartha%20Nursery/node_modules/vite/dist/node/index.js";
import laravel from "file:///E:/Samartha%20Nursery/node_modules/laravel-vite-plugin/dist/index.js";
import react from "file:///E:/Samartha%20Nursery/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "node:path";
import autoprefixer from "file:///E:/Samartha%20Nursery/node_modules/autoprefixer/lib/autoprefixer.js";
import { VitePWA } from "file:///E:/Samartha%20Nursery/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "E:\\Samartha Nursery";
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
      port: 3e3,
      proxy: {
        // https://vitejs.dev/config/server-options.html
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxTYW1hcnRoYSBOdXJzZXJ5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxTYW1hcnRoYSBOdXJzZXJ5XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9TYW1hcnRoYSUyME51cnNlcnkvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IGxhcmF2ZWwgZnJvbSAnbGFyYXZlbC12aXRlLXBsdWdpbidcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJ1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIlxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IG1hbmlmZXN0SWNvbnMgPSBbXG4gICAge1xuICAgICAgXCJzcmNcIjogXCIvbWFuaWZlc3QtaWNvbi0xOTIubWFza2FibGUucG5nXCIsXG4gICAgICBcInNpemVzXCI6IFwiMTkyeDE5MlwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICBcInB1cnBvc2VcIjogXCJhbnlcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJzcmNcIjogXCIvbWFuaWZlc3QtaWNvbi0xOTIubWFza2FibGUucG5nXCIsXG4gICAgICBcInNpemVzXCI6IFwiMTkyeDE5MlwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICBcInB1cnBvc2VcIjogXCJtYXNrYWJsZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInNyY1wiOiBcIi9tYW5pZmVzdC1pY29uLTUxMi5tYXNrYWJsZS5wbmdcIixcbiAgICAgIFwic2l6ZXNcIjogXCI1MTJ4NTEyXCIsXG4gICAgICBcInR5cGVcIjogXCJpbWFnZS9wbmdcIixcbiAgICAgIFwicHVycG9zZVwiOiBcImFueVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInNyY1wiOiBcIi9tYW5pZmVzdC1pY29uLTUxMi5tYXNrYWJsZS5wbmdcIixcbiAgICAgIFwic2l6ZXNcIjogXCI1MTJ4NTEyXCIsXG4gICAgICBcInR5cGVcIjogXCJpbWFnZS9wbmdcIixcbiAgICAgIFwicHVycG9zZVwiOiBcIm1hc2thYmxlXCJcbiAgICB9XG4gIF07XG5cbiAgY29uc3QgcHVibGljSWNvbnMgPSBbXG4gICAgeyBzcmM6ICcvZmF2aWNvbi5pY28nIH0sXG4gICAgeyBzcmM6ICcvZmF2aWNvbi5zdmcnIH0sXG4gICAgeyBzcmM6ICcvYXBwbGUtdG91Y2gtaWNvbi0xODAucG5nJyB9XG4gIF07XG5cbiAgY29uc3QgYWRkaXRpb25hbEltYWdlcyA9IFtdO1xuXG4gIHJldHVybiB7XG4gICAgYmFzZTogJy4vJyxcbiAgICAvLyBidWlsZDoge1xuICAgIC8vICAgb3V0RGlyOiAnYnVpbGQnLFxuICAgIC8vIH0sXG4gICAgY3NzOiB7XG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICBhdXRvcHJlZml4ZXIoe30pLCAvLyBhZGQgb3B0aW9ucyBpZiBuZWVkZWRcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBlc2J1aWxkOiB7XG4gICAgICBsb2FkZXI6ICdqc3gnLFxuICAgICAgaW5jbHVkZTogL3JlYWN0XFwvLipcXC5qc3g/JC8sXG4gICAgICBleGNsdWRlOiBbXSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZm9yY2U6IHRydWUsXG4gICAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgICBsb2FkZXI6IHtcbiAgICAgICAgICAnLmpzJzogJ2pzeCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgbGFyYXZlbCh7XG4gICAgICAgIGlucHV0OiBbJ3Jlc291cmNlcy9yZWFjdC9pbmRleC5qcyddLFxuICAgICAgICByZWZyZXNoOiB0cnVlLFxuICAgICAgfSksXG4gICAgICByZWFjdCgpLFxuICAgICAgVml0ZVBXQSh7XG4gICAgICAgIC8vIE1ha2UgdGhlIFBXQSBwbHVnaW4gYnVpbGQgdG8gdGhlIHNhbWUgcGxhY2UgYXMgbGFyYXZlbC92aXRlLXBsdWdpblxuICAgICAgICBidWlsZEJhc2U6ICcvYnVpbGQvJyxcblxuICAgICAgICAvLyBEZWZpbmUgdGhlIHNjb3BlIGFuZCB0aGUgYmFzZSBzbyB0aGF0IHRoZSBQV0EgY2FuIHJ1biBmcm9tIHRoZVxuICAgICAgICAvLyByb290IG9mIHRoZSBkb21haW4sIGV2ZW4gdGhvdWdoIHRoZSBmaWxlcyBsaXZlIGluIC9idWlsZC5cbiAgICAgICAgLy8gVGhpcyByZXF1aXJlcyB0aGUgc2VydmljZSB3b3JrZXIgdG8gYmUgc2VydmVkIHdpdGhcbiAgICAgICAgLy8gYSBoZWFkZXIgYFNlcnZpY2UtV29ya2VyLUFsbG93ZWQ6IC9gIHRvIGF1dGhvcmlzZSBpdC5cbiAgICAgICAgLy8gQHNlZSBzZXJ2ZXIucGhwXG4gICAgICAgIHNjb3BlOiAnL2J1aWxkLycsXG4gICAgICAgIGJhc2U6ICcvJyxcblxuICAgICAgICAvLyBVc2UgJ3Byb21wdCcgZm9yIG5ldyB2ZXJzaW9ucyBvZiB0aGUgUFdBLiAnYXV0b1VwZGF0ZScgaXNcbiAgICAgICAgLy8gc2ltcGxlciBidXQgbWF5IGFzIHdlbGwgZG1lbyBob3cgdGhpcyB3b3Jrcy5cbiAgICAgICAgcmVnaXN0ZXJUeXBlOiAncHJvbXB0JyxcblxuICAgICAgICAvLyBEbyBub3QgdXNlIHRoZSBQV0Egd2l0aCBkZXYgYnVpbGRzLlxuICAgICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgICAgICBlbmFibGVkOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFRoZSBWaXRlIFBXQSBkb2NzIHN1Z2dlc3QgeW91IHNob3VsZCB1c2UgaW5jbHVkZUFzc2V0cyBmb3JcbiAgICAgICAgLy8gaWNvbnMgdGhhdCBhcmUgbm90IGluIHRoZSBtYW5pZmVzdC4gQnV0IGxhcmF2ZWwvdml0ZS1wbHVnaW5cbiAgICAgICAgLy8gZG9lcyBub3QgdXNlIGEgcHVibGljIGRpciBpbiB0aGUgYnVpbGQgLSBpdCByZWxpZXMgb25cbiAgICAgICAgLy8gTGFyYXZlbCdzLiBJZiB3ZSBhZGQgdGhpcyBhcyBhIHB1YmxpY0RpciB0byB2aXRlJ3MgY29uZmlnXG4gICAgICAgIC8vIHRoZW4gdml0ZS1wbHVnaW4tcHdhIGZpbmRzIGV2ZXJ5dGhpbmcgaW4gcHVibGljIChlZyBpZiB5b3UgYXJlXG4gICAgICAgIC8vIHVzaW5nIHRlbGVzY29wZSB0aGVuIGFsbCBpdHMgYXNzZXRzIGdldCBjYWNoZWQpLiBJdCB0aGVuIGFkZHNcbiAgICAgICAgLy8gdGhlc2UgYXNzZXRzIHRvIHRoZSBzZXJ2aWNlIHdvcmtlciB3aXRoIHRoZSBgL2J1aWxkYCBwcmVmaXgsXG4gICAgICAgIC8vIHdoaWNoIGRvZXNuJ3Qgd29yay4gSSBmb3VuZCBpdCBlYXNpZXN0IHRvIGxlYXZlIHRoaXMgZW1wdHlcbiAgICAgICAgLy8gYW5kIHVzZSBgYWRkaXRpb25hbE1hbmlmZXN0RW50cmllc2AgYmVsb3cuXG4gICAgICAgIGluY2x1ZGVBc3NldHM6IFtdLFxuXG4gICAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgICAgIC8vIEFkZCBhbGwgdGhlIGFzc2V0cyBidWlsdCBieSBWaXRlIGludG8gdGhlIHB1YmxpYy9idWlsZC9hc3NldHNcbiAgICAgICAgICAgIC8vIGZvbGRlciB0byB0aGUgU1cgY2FjaGUuXG4gICAgICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLGpwZyxwbmcsc3ZnLHdvZmYsd29mZjIsdHRmLGVvdH0nXSxcblxuICAgICAgICAgICAgLy8gRGVmaW5lIHRoZSByb290IFVSTCBhcyB0aGUgZW50cnlwb2ludCBmb3IgdGhlIG9mZmxpbmUgYXBwLlxuICAgICAgICAgICAgLy8gdnVlLXJvdXRlciBjYW4gdGhlbiB0YWtlcyBvdmVyIGFuZCBzaG93cyB0aGUgY29ycmVjdCBwYWdlXG4gICAgICAgICAgICAvLyBpZiB5b3UgYXJlIHVzaW5nIGl0LlxuICAgICAgICAgICAgbmF2aWdhdGVGYWxsYmFjazogJy8nLFxuXG4gICAgICAgICAgICAvLyBTdG9wcyB2YXJpb3VzIHBhdGhzIGJlaW5nIGludGVyY2VwdGVkIGJ5IHRoZSBzZXJ2aWNlIHdvcmtlclxuICAgICAgICAgICAgLy8gaWYgdGhleSdyZSBub3QgYXZhaWxhYmxlIG9mZmxpbmUuIFRlbGVzY29wZSBpcyBhIGdvb2RcbiAgICAgICAgICAgIC8vIGV4YW1wbGUsIGlmIHlvdSBhcmUgdXNpbmcgdGhhdC5cbiAgICAgICAgICAgIG5hdmlnYXRlRmFsbGJhY2tEZW55bGlzdDogWy9eXFwvdGVsZXNjb3BlL10sXG5cbiAgICAgICAgICAgIC8vIEFkZCBzb21lIGV4cGxpY2l0IFVSTHMgdG8gdGhlIFNXIHByZWNhY2hlLiBUaGlzIGhlbHBzIHVzXG4gICAgICAgICAgICAvLyB3b3JrIHdpdGggdGhlIGxhcmF2ZWwvdml0ZS1wbHVnaW4gc2V0dXAuXG4gICAgICAgICAgICBhZGRpdGlvbmFsTWFuaWZlc3RFbnRyaWVzOiBbXG4gICAgICAgICAgICAgICAgLy8gQ2FjaGUgdGhlIHJvb3QgVVJMIHRvIGdldCBob2xkIG9mIHRoZSBQV0EgSFRNTCBlbnRyeXBvaW50XG4gICAgICAgICAgICAgICAgLy8gZGVmaW5lZCBpbiB3ZWxjb21lLmJsYWRlLnBocC4gUmVmOlxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92aXRlLXB3YS92aXRlLXBsdWdpbi1wd2EvaXNzdWVzLzQzMSNpc3N1ZWNvbW1lbnQtMTcwMzE1MTA2NVxuICAgICAgICAgICAgICAgIHsgdXJsOiAnLycsIHJldmlzaW9uOiBgJHtEYXRlLm5vdygpfWAgfSxcblxuICAgICAgICAgICAgICAgIC8vIENhY2hlIHRoZSBpY29ucyBkZWZpbmVkIGFib3ZlIGZvciB0aGUgbWFuaWZlc3RcbiAgICAgICAgICAgICAgICAuLi5tYW5pZmVzdEljb25zLm1hcCgoaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB1cmw6IGkuc3JjLCByZXZpc2lvbjogYCR7RGF0ZS5ub3coKX1gIH1cbiAgICAgICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgICAgIC8vIENhY2hlIHRoZSBvdGhlciBvZmZsaW5lIGljb25zIGRlZmluZWQgYWJvdmVcbiAgICAgICAgICAgICAgICAuLi5wdWJsaWNJY29ucy5tYXAoKGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdXJsOiBpLnNyYywgcmV2aXNpb246IGAke0RhdGUubm93KCl9YCB9XG4gICAgICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgICAgICAvLyBDYWNoZSBhbnkgYWRkaXRpb25hbCBpbWFnZXMgZGVmaW5lZCBhYm92ZVxuICAgICAgICAgICAgICAgIC4uLmFkZGl0aW9uYWxJbWFnZXMubWFwKChpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHVybDogaS5zcmMsIHJldmlzaW9uOiBgJHtEYXRlLm5vdygpfWAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdLFxuXG4gICAgICAgICAgICAvLyBFbnN1cmUgdGhlIEpTIGJ1aWxkIGRvZXMgbm90IGdldCBkcm9wcGVkIGZyb20gdGhlIGNhY2hlLlxuICAgICAgICAgICAgLy8gVGhpcyBhbGxvd3MgaXQgdG8gYmUgYXMgYmlnIGFzIDNNQlxuICAgICAgICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDUgKiAxMDI0ICogMTAyNCxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gTWFuaWZlc3Qgc2V0dGluZ3MgLSB0aGVzZSB3aWxsIGFwcGVhciBpbiB0aGUgZ2VuZXJhdGVkIG1hbmlmZXN0LndlYm1hbmlmZXN0XG4gICAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgICAgbmFtZTogXCJTYW1hcnRoIE51cnNlcnlcIixcbiAgICAgICAgICBzaG9ydF9uYW1lOiBcIlNhbWFydGggTnVyc2VyeVwiLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkFuIGFwcCB0byBTYW1hcnRoIE51cnNlcnkuXCIsXG4gICAgICAgICAgdGhlbWVfY29sb3I6IFwiIzE3MTcxN1wiLFxuICAgICAgICAgIGJhY2tncm91bmRfY29sb3I6IFwiI2U4ZWJmMlwiLFxuICAgICAgICAgIGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxuICAgICAgICAgIHNjb3BlOiBcIi9cIixcbiAgICAgICAgICBzdGFydF91cmw6IFwiL1wiLFxuICAgICAgICAgIG9yaWVudGF0aW9uOiBcInBvcnRyYWl0XCIsXG4gICAgICAgICAgaWNvbnM6IFsuLi5tYW5pZmVzdEljb25zXVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6ICdyZXNvdXJjZXMvcmVhY3QvJyxcbiAgICAgICAgICByZXBsYWNlbWVudDogYCR7cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3Jlc291cmNlcy9yZWFjdCcpfS9gLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGV4dGVuc2lvbnM6IFsnLm1qcycsICcuanMnLCAnLnRzJywgJy5qc3gnLCAnLnRzeCcsICcuanNvbicsICcuc2NzcyddLFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9zZXJ2ZXItb3B0aW9ucy5odG1sXG4gICAgICB9LFxuICAgIH0sXG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlQLFNBQVMsY0FBYyxlQUFlO0FBQ3ZSLE9BQU8sYUFBYTtBQUNwQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sa0JBQWtCO0FBQ3pCLFNBQVMsZUFBZTtBQUx4QixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLGdCQUFnQjtBQUFBLElBQ3BCO0FBQUEsTUFDRSxPQUFPO0FBQUEsTUFDUCxTQUFTO0FBQUEsTUFDVCxRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsSUFDYjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQU87QUFBQSxNQUNQLFNBQVM7QUFBQSxNQUNULFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxJQUNiO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBTztBQUFBLE1BQ1AsU0FBUztBQUFBLE1BQ1QsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFPO0FBQUEsTUFDUCxTQUFTO0FBQUEsTUFDVCxRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsSUFDYjtBQUFBLEVBQ0Y7QUFFQSxRQUFNLGNBQWM7QUFBQSxJQUNsQixFQUFFLEtBQUssZUFBZTtBQUFBLElBQ3RCLEVBQUUsS0FBSyxlQUFlO0FBQUEsSUFDdEIsRUFBRSxLQUFLLDRCQUE0QjtBQUFBLEVBQ3JDO0FBRUEsUUFBTSxtQkFBbUIsQ0FBQztBQUUxQixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJTixLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDUCxTQUFTO0FBQUEsVUFDUCxhQUFhLENBQUMsQ0FBQztBQUFBO0FBQUEsUUFDakI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0Es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
