<template>
    <div class="easter-egg">
        <h1 class="title">🎉 恭喜你发现了隐藏的彩蛋！</h1>
        <p>当前模式：{{env}}</p>
        <div class="dev-only" v-if="isDevelopment">
            <h1 class="title">Development 专有彩蛋</h1>
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
        isDevelopment() {
            return this.env === "development";
        }
    }
}
</script>
