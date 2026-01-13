import type { Plugin } from 'vite'

export function fixNitroInlineDynamicImports(): Plugin {
  return {
    name: 'fix-nitro-inline-dynamic-imports',
    enforce: 'post',
    configResolved(config) {
      const nitroEnv = config.environments?.nitro
      if (!nitroEnv?.build?.rollupOptions?.output)
        return

      const output = nitroEnv.build.rollupOptions.output
      if (!Array.isArray(output) && output.inlineDynamicImports) {
        delete output.manualChunks
      }
    },
  }
}
