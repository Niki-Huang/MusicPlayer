let startY = 0;
let moveY = 0;
let moveDistance = 0;
import request from '../../utils/request.js'
import {
    alert
} from '../../utils/normal_fun.js'
import config from '../../utils/config.js'
Page({
    data: {
        tolog: true,
        coverTransform: 'translateY(0)',
        coverTransition: '',
        avatarUrl: '/static/images/personal/bgImg2.jpg',
        nickname: '游客',
        backgroundUrl: '/static/images/personal/bgImg2.jpg',
        userInfo: {},
        recentPlayList: [],
        myLikeList: []
    },

    async getUserRecentPlayList(userId, count = 8) {
        let recentRlayListData = await request('/user/record', {
            uid: this.data.userInfo.userId,
            type: 1
        })
        let index = 0;
        let recentPlayList = recentRlayListData.weekData.splice(0, count).map(item => {
            item.id = index++;
            return item
        });
        this.setData({
            recentPlayList
        })
    },

    async getMyLikeList(userId, count = 8) {
        //歌单
        let playListData = await request('/user/playlist', {
            uid: this.data.userInfo.userId,
        })
        //我的喜欢歌单的id
        let like_id = playListData.playlist[0].id;
        //我的喜欢歌单的详情
        let myLikeListSummary = await request('/playlist/detail', {
            id: like_id
        })
        //我的喜欢列表
        let myLikeList = myLikeListSummary.playlist.tracks.splice(0, count)
        this.setData({
            myLikeList
        })
    },

    onLoad: function(options) {
        //验证是否已经登录
        let musiccookie = wx.getStorageSync("musiccookie");
        if (!musiccookie)
            return;
        wx.request({
            url: `${config.mobilehost}/login/status?cookie=${musiccookie}`,
            success: (res) => {
                let loginstatus = res.data;
                if (loginstatus.data.code == 200) {
                    let userInfo = loginstatus.data.profile;
                    wx.setStorageSync('userInfo', loginstatus.data.profile);
                    this.setData({
                        tolog: false,
                        avatarUrl: userInfo.avatarUrl,
                        nickname: userInfo.nickname,
                        backgroundUrl: userInfo.backgroundUrl,
                        userInfo: userInfo
                    })
                    console.log('身份验证成功');
                    //获取播放记录
                    this.getUserRecentPlayList(userInfo.userId);
                    //获取我的喜欢
                    // this.getMyLikeList(userInfo.userId);
                } else {
                    console.log('请登录');
                }
            },
            fail: function(err) {
                console.log(err)
            }
        })
    },

    toLogin() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    },

    handleTouchStart(event) {
        this.setData({
            coverTransition: ''
        })
        startY = event.touches[0].clientY;
    },

    handleTouchMove(event) {
        moveY = event.touches[0].clientY;
        moveDistance = moveY - startY;
        if (moveDistance < 0)
            return;
        if (moveDistance >= 100)
            moveDistance = 100;
        this.setData({
            coverTransform: `translateY(${moveDistance}rpx)`
        })
    },

    handleTouchEnd() {
        this.setData({
            coverTransform: `translateY(0rpx)`,
            coverTransition: 'transform 0.5s linear'
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