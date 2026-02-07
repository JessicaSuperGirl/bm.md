import type { PageMeta } from '@/lib/seo'
import { createFileRoute } from '@tanstack/react-router'
import PageDialog from '@/components/dialog/page'
import { createPageHead } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_layout/about')({
  loader: () => {
    const meta: PageMeta = { title: '关于 Hertz.md' }
    return { meta }
  },
  head: ({ loaderData, match }) => loaderData
    ? createPageHead({ pathname: match.pathname, meta: loaderData.meta })
    : {},
  component: AboutModal,
})

function AboutModal() {
  const { meta } = Route.useLoaderData()
  return (
    <PageDialog
      title={meta.title}
      description={meta.description}
      render={(
        <article
          className={cn(
            `
              prose prose-sm prose-zinc
              dark:prose-invert
              prose-h1:hidden
              prose-hr:my-4
            `,
            'max-w-none',
          )}
        >
          <h2>✨ 特性</h2>
          <ul>
            <li>📝 <strong>实时预览</strong> - 基于 CodeMirror 6 的 Markdown 编辑器，所见即所得</li>
            <li>🎨 <strong>14 种排版样式</strong> - 从专业商务到复古怀旧，满足不同场景需求</li>
            <li>🌈 <strong>14 种代码主题</strong> - 支持浅色/深色多种代码高亮风格</li>
            <li>📱 <strong>多平台适配</strong> - 一键复制到微信公众号、知乎、掘金</li>
            <li>🖼️ <strong>图片导出</strong> - 将排版内容导出为图片分享</li>
            <li>🔌 <strong>开发者友好</strong> - 提供 REST API 和 MCP 协议集成</li>
            <li>⌨️ <strong>快捷操作</strong> - 命令面板 + 全局快捷键，高效操作</li>
          </ul>
        </article>
      )}
    />
  )
}
