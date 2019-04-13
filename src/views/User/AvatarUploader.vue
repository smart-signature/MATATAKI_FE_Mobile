<template>
  <img style="position:absolute; z-index:1;left:40px;"
          width="50px" src="/img/camera.png">
</template>

<script>
import { OrderBy, getArticles } from '@/api/backend';
import { ArticleCard } from '@/components/';
import { mapGetters } from 'vuex';

export default {
  name: 'AvatarUploader',
}