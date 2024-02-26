import request from '../../utils/request.js'

Page({
    data: {
        //轮播图数据
        bannerList: [],
        //推荐歌单数据
        recommendList: [],
        //精品歌单
        jingPingList: [],
    },

    async getBannerListData() {
        let bannerListData = await request('/banner', {
            type: 2
        });
        this.setData({
            bannerList: bannerListData.banners
        })
    },

    async getRecommendListData() {
        let recommendListData = await request('/personalized', {
            limit: 6
        })
        this.setData({
            recommendList: recommendListData.result,
        })
    },

    async getJingPingListData() {
        let jingPingListData = await request('/top/playlist/highquality')
        let jingPingList = [];
        for (const item of jingPingListData.playlists.slice(0, 5)) {
            let jId = item.id;
            let geDangListData = await request('/playlist/detail', {
                id: jId
            });
            let geDangList = geDangListData.playlist.tracks.slice(0, 3);
            // 更新 jingPingList，每次处理一个请求就更新一次
            jingPingList.push({
                name: item.name,
                id: jId,
                tracks: geDangList
            });
            // 更新前端数据
            this.setData({
                jingPingList
            });
        }
    },

    toRecommendSong() {
        wx.navigateTo({
            url: '/pages/recommendSong/recommendSong',
        })
    },

    onLoad: async function(options) {
        //轮播图数据
        this.getBannerListData()
        //推荐歌单数据
        this.getRecommendListData()
        //精品歌单
        this.getJingPingListData()
    },

    onReady: function() {

    },

    onShow: function() {

    },

    onHide: function() {

    },

    onUnload: function() {

    },

    onPullDownRefresh: function() {

    },

    onReachBottom: function() {

    },

    onShareAppMessage: function() {

    }
})