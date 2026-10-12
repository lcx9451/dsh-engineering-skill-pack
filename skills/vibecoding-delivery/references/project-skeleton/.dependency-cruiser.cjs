/**
 * dependency-cruiser 配置：把 docs/architecture.md 的"禁止的调用方向"变成机械检查。
 *
 * ⚠️ 这里的 path 正则是**示例**，必须以本仓库实际输出为准先跑一次：
 *   pnpm exec depcruise src --output-type dot | head
 * 或
 *   pnpm exec depcruise src --include-only "^src" --output-type text
 * 确认匹配到的是相对路径（如 src/core/x.ts）后再定稿。规则跑不起来 = 没有规则。
 *
 * CI 中执行：pnpm exec depcruise --validate src
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: '禁止环形依赖：模块之间只能单向依赖（见 docs/architecture.md）',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-controller-to-db',
      severity: 'error',
      comment: '路由/控制器层禁止直接访问数据库或 ORM，必须经 core 领域层',
      from: { path: '^src/api' },
      to: { path: '^src/infra/(db|orm)' },
    },
    {
      name: 'core-is-pure',
      severity: 'error',
      comment: 'core 是纯领域逻辑，禁止依赖 web / api / worker',
      from: { path: '^src/core' },
      to: { path: '^src/(web|api|worker)' },
    },
    {
      name: 'infra-has-no-business',
      severity: 'error',
      comment: 'infra 只是适配器，禁止反向依赖业务模块',
      from: { path: '^src/infra' },
      to: { path: '^src/(core|api|worker|web)' },
    },
    {
      name: 'no-cross-module-internals',
      severity: 'error',
      comment: '跨模块只能走对方公开入口 index.ts，禁止引用内部文件',
      from: { path: '^src/([^/]+)/' },
      to: { path: '^src/[^/]+/(?!index\\.ts)' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(node_modules|dist|coverage|test|tests|\\.test\\.)' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
}
