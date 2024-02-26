import pubSub from 'pubsub-js'
import request from '../../utils/request.js'
Page({

    data: {
        day: '',
        month: '',
        recommendList: [],
        index: 0
    },

    async getRecommendSongs() {
        let recommendListData = await request('/recommend/songs', {
            cookie: wx.getStorageSync('musiccookie')
        })
        this.setData({
            recommendList: recommendListData.data.dailySongs.slice(0, 15)
        })
    },

    toSongDetail(event) {
        let {
            song,
            index
        } = event.currentTarget.dataset
        this.setData({
            index
        })
        wx.navigateTo({
            url: '/pages/songDetail/songDetail?musicId=' + song.id
        })
    },
    onLoad: function(options) {
        this.setData({
            day: new Date().getDate(),
            month: new Date().getMonth() + 1
        })
        this.getRecommendSongs()
        pubSub.subscribe('switchType', (msg, type) => {
            let {
                recommendList,
                index
            } = this.data
            if (type === 'pre') {
                (index == 0) && (index = recommendList.length)
                index -= 1
            } else {
                (index == recommendList.length - 1) && (index = -1)
                index += 1;
            }
            this.setData({
                index
            })
            let musicId = recommendList[index].id
            pubSub.publish('musicId', musicId)
        })
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