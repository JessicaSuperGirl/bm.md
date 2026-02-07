import { createRequire } from 'node:module'
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { name } from './package.json'
import { cssRawMinifyPlugin, fixNitroInlineDynamicImports, htmlRawMinifyPlugin, markdownPlugin } from './scripts/vite'
import { appConfig } from './src/config/app'

const require = createRequire(import.meta.url)

export default defineConfig(() => {
  const isAliyunESA = Boolean(process.env.AliUid)
  const isTencentEdgeOne = process.env.HOME === '/dev/shm/home' && process.env.TMPDIR === '/dev/shm/tmp'
  const isCloudflare = process.env.BUILD_TARGET === 'cloudflare'

  let customPreset: string | undefined
  if (isCloudflare) {
    customPreset = 'cloudflare-pages'
  }
  else if (isAliyunESA) {
    customPreset = './preset/aliyun-esa/nitro.config.ts'
  }
  else if (isTencentEdgeOne) {
    customPreset = './preset/tencent-edgeone/nitro.config.ts'
  }

  // 严格遵循原有的输出逻辑，仅在特定平台修改
  const outDir = isAliyunESA ? 'dist/client' : '.output/public'
  // 如果是 Cloudflare，我们也使用 .output/public (因为 Nitro 默认就是这里，除非你改了后台设置)
  // 如果你在 Cloudflare 后台填了 dist，这里也得保持同步。
  // 但为了 PWA 插件不报错，我们先按标准逻辑走。

  return {
    plugins: [
      fixNitroInlineDynamicImports(),
      cssRawMinifyPlugin(),
      htmlRawMinifyPlugin(),
      markdownPlugin(),
      devtools(),
      ...(
        process.env.NODE_ENV !== 'test'
          ? [nitro({
              preset: customPreset,
              cloudflare: {
                wrangler: {
                  name,
                  observability: { enabled: true },
                },
              },
            })]
          : []),
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart({
        prerender: {
          enabled: isAliyunESA, // 恢复原状，只在 AliyunESA 开启预渲染，减少 Hydration 错误
          filter: ({ path }) =>
            path === '/'
            || path === '/about'
            || path.startsWith('/docs'),
        },
      }),
      viteReact({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        outDir: isCloudflare ? 'dist' : outDir, // 适配 Cloudflare 构建路径
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        manifest: {
          name: appConfig.name,
          short_name: appConfig.name,
          description: appConfig.description,
          id: '/',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          theme_color: appConfig.themeColor.dark,
          background_color: appConfig.themeColor.dark,
          icons: [
            { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        'decode-named-character-reference': require.resolve('decode-named-character-reference'),
        'hast-util-from-html-isomorphic': require.resolve('hast-util-from-html-isomorphic'),
      },
    },
    worker: {
      format: 'es',
      plugins: () => [
        viteTsConfigPaths({
          projects: ['./tsconfig.json'],
        }),
      ],
    },
  }
})
