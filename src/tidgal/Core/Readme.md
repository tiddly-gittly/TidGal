# WebGAL fork

This is copy from [WebGAL's packages/webgal/src/Core](https://github.com/OpenWebGAL/WebGAL/tree/main/packages/webgal/src/Core), with following modification:

1. 安装对应原仓库版本的依赖，注意 pixi 等库都是旧版的，新版的类型对应不上了
1. `pnpm exec eslint src/**/*.ts --fix`
1. `initializeScript.ts` 作为入口点，暴露为可被 `require` 的库，需要传入参数，以确定从哪些条目里加载资源
