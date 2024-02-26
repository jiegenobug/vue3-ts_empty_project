<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
const Logins = async () => {
  await userStore.login({ phoneNumber: "15201956179", password: 123456 });
  router.push('/')
};
</script>
<template>
  登录页
  <button @click="Logins">登录</button>
</template>

<style scoped lang="less"></style>
