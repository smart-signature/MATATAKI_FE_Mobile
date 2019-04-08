<template>
    <div class="easter-egg">
        <h1 class="title">🎉 恭喜你发现了隐藏的彩蛋！</h1>
        <p>当前模式：{{env}}</p>
        <div class="dev-only" v-if="isDevelopment">
            <h1 class="title">Development 专有彩蛋</h1>
            <p>版本号： {{ version }}</p>
            <p v-if="checkIsBuildOnCommit">基于 Commit {{ commitHash }} 构建</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "Easter-Egg",
    computed: {
        env() {
            return process.env.NODE_ENV;
        },
        version() {
            return process.env.VUE_APP_VERSION
        },
        isDevelopment() {
            return this.env === "development";
        },
        commitHash() {
            return process.env.VUE_APP_COMMIT_HASH
        },
        checkIsBuildOnCommit() {
            // undefined will be stringify to "undefined" 
            // Ref: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/util/resolveClientEnv.js#L1
            return this.commitHash !== "undefined"
        }
    }
}
</script>
