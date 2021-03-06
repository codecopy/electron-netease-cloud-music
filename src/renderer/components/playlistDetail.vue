<template>
    <div class="playlist-detail">
        <div class="header">
            <img :src="coverSrc"
                class="cover">
            <div class="desc">
                <p class="name">{{detail.name}}</p>
                <div class="creator">
                    <mu-avatar class="avatar">
                        <img :src="creatorAvatarSrc">
                    </mu-avatar>
                    <span class="creator-name">{{detail.creator.nickname}}</span>
                    <span class="create-time">创建于 {{createTime}}</span>
                </div>
                <div class="actions">
                    <mu-button flat
                        :disabled="detail.creator.id === user.id"
                        @click="handleSubscribe">
                        <mu-icon left
                            :color="detail.subscribed ? 'amber' : ''"
                            :value="detail.subscribed ? 'star' : 'star_border'"></mu-icon>
                        {{ detail.subscribed ? '已收藏' : '收藏' }} ({{formatCount(detail.subscribedCount)}})
                    </mu-button>
                    <mu-button flat>
                        <mu-icon left
                            value="comment"></mu-icon>
                        评论 ({{formatCount(detail.commentCount)}})
                    </mu-button>
                </div>
                <div class="intro">
                    <mu-list toggle-nested>
                        <mu-list-item button
                            nested
                            :open="descOpen"
                            @click="descOpen = !descOpen">
                            <mu-list-item-title>歌单介绍</mu-list-item-title>
                            <mu-list-item-action>
                                <mu-icon class="toggle-icon"
                                    size="24"
                                    value="keyboard_arrow_down"></mu-icon>
                            </mu-list-item-action>
                            <mu-list-item-content slot="nested">
                                <div class="description">{{detail.description}}</div>
                            </mu-list-item-content>
                        </mu-list-item>
                    </mu-list>
                </div>
            </div>
        </div>
        <div class="tracks">
            <mu-sub-header>曲目列表</mu-sub-header>
            <PlayAll :tracks="detail.tracks"></PlayAll>
            <TrackList :tracks="tracksToShow"
                :indexOffset="tracksOffset"></TrackList>
            <div class="pagination"
                v-if="detail.tracks.length > 50">
                <mu-pagination :total="detail.tracks.length"
                    :current="currentPage"
                    :page-size="pageSize"
                    @change="handlePageChange">
                </mu-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import PlayAll from '@/components/playAll.vue';
import TrackList from '@/components/trackList.vue';
import { sizeImg, HiDpiPx } from '@/util/image';
import { shortDate } from '@/util/formatter';

export default {
    props: {
        detail: {
            required: true
        }
    },
    data() {
        return {
            descOpen: false,
            scrollHeight: 200,
            currentPage: 1,
            pageSize: 50
        };
    },
    computed: {
        ...mapGetters(['user', 'loginValid']),
        creatorAvatarSrc() {
            return sizeImg(this.detail.creator.avatarUrl, HiDpiPx(40));
        },
        coverSrc() {
            return sizeImg(this.detail.coverImgUrl, HiDpiPx(160));
        },
        createTime() {
            return shortDate(this.detail.createTime);
        },
        tracksOffset() {
            return (this.currentPage - 1) * this.pageSize;
        },
        tracksToShow() {
            return this.detail.tracks.slice(this.tracksOffset, this.tracksOffset + this.pageSize);
        }
    },
    methods: {
        ...mapActions(['subscribePlaylist', 'unsubscribePlaylist']),
        formatCount(cnt) {
            return typeof cnt === 'number' ? cnt : '...';
        },
        handlePageChange(newIndex) {
            this.$emit('detail-scroll', this.scrollHeight);
            this.currentPage = newIndex;
        },
        async handleSubscribe() {
            if (!this.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            if (this.detail.subscribed) {
                try {
                    await this.unsubscribePlaylist(this.detail);
                    this.detail.subscribed = false;
                    this.detail.subscribedCount--;
                } catch (e) {
                    this.$toast.message(`取消收藏失败 ●﹏● ： ${e.code}`);
                }
                return;
            }
            try {
                await this.subscribePlaylist(this.detail);
                this.detail.subscribed = true;
                this.detail.subscribedCount++;
            } catch (e) {
                this.$toast.message(`收藏歌单失败 ●﹏● ： ${e.code}`);
            }
        }
    },
    mounted() {
        try {
            this.scrollHeight = document.querySelector('.playlist-detail .header').clientHeight;
        } catch (e) { /* we will use the default height 200px now */ }
    },
    watch: {
        ['detail.id']() {
            this.currentPage = 1;
        }
    },
    components: {
        PlayAll,
        TrackList
    }
};
</script>

<style lang="less">
.playlist-detail {
    .header {
        display: flex;
        padding: 16px;
        .cover {
            height: 160px;
            width: 160px;
            min-width: 160px;
            margin-right: 10px;
        }
        .desc {
            flex-grow: 1;
            .name {
                font-size: 20px;
                margin: 0 0 8px 12px;
            }
            .creator {
                margin: 8px 12px;
                display: flex;
                align-items: center;
                .creator-name {
                    margin: 0 10px;
                }
                .create-time {
                    color: grey;
                }
            }
            .actions {
                display: flex;
            }
            .intro {
                .mu-list {
                    padding: 0;
                }
                .description {
                    margin: 8px;
                    white-space: pre-wrap;
                }
            }
        }
    }
    .tracks {
        .pagination {
            width: 100%;
            padding: 16px;
        }
    }
}
</style>
