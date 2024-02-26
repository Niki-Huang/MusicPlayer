import config from '../../utils/config.js'
import request from '../../utils/request.js'
import {
    alert
} from '../../utils/normal_fun.js'
Page({
    data: {
        videoGroupList: [],
        navId: '',
        videoList: [],
        videoListLength: 0,
        videoId: '',
        videoUpdateTime: [],
        isTriggered: false,
        offset: 0
    },

    toSearch() {
        wx.navigateTo({
            url: '/pages/search/search',
        })
    },

    async getVideoGroupListData() {
        let videoGroupListData = await request('/video/group/list');
        this.setData({
            videoGroupList: videoGroupListData.data.slice(0, 14),
            navId: videoGroupListData.data[0].id
        })
        //获取视频列表数据
        this.getVideoList(this.data.navId);
    },

    async getVideoList(navId, offset = 0, isnew = false) {
        if (isnew)
            wx.showLoading({
                title: '正在加载',
            })
        let cookie = wx.getStorageSync('musiccookie');
        let videoListData = await request('/video/group', {
            id: navId,
            offset: offset * this.data.videoListLength,
            cookie,
        })
        wx.hideLoading();
        let index = offset * this.data.videoListLength;
        let promises = videoListData.datas.map(async item => {
            item.id = index++;
            let vidUrlData = await request('/video/url', {
                id: item.data.vid,
                cookie
            });
            item.vidUrl = vidUrlData.urls[0].url;
            return item;
        });
        Promise.all(promises)
            .then(newvideoList => {
                if (this.data.isTriggered)
                    alert('刷新成功', 'success', 1000)
                if (!isnew)
                    this.setData({
                        videoList: newvideoList,
                        videoListLength: newvideoList.length,
                        isTriggered: false
                    });
                else {
                    let {
                        videoList
                    } = this.data;
                    videoList = [...videoList, ...newvideoList];
                    this.setData({
                        videoList,
                        isTriggered: false
                    });
                }
            })
            .catch(err => {
                console.error(err);
            });
    },

    changeNav(event) {
        let navid = event.currentTarget.id;
        this.setData({
            navId: navid * 1,
            videoList: [],
            offset: 0,
            videoListLength: 0
        })
        wx.showLoading({
            title: '正在加载',
        })
        this.getVideoList(this.data.navId)
    },

    handlePlay(event) {
        let vid = event.currentTarget.id
        this.vid !== vid && this.videoContext && this.videoContext.stop();
        this.vid = vid;
        this.setData({
            videoId: vid
        })
        this.videoContext = wx.createVideoContext(vid);
        let {
            videoUpdateTime
        } = this.data
        let videoItem = videoUpdateTime.find(item => item.vid === vid)
        if (videoItem)
            this.videoContext.seek(videoItem.currentTime)
        this.videoContext.play();
    },

    handleTimeUpdate(event) {
        let videoTimeObj = {
            vid: event.currentTarget.id,
            currentTime: event.detail.currentTime
        }
        let {
            videoUpdateTime
        } = this.data

        let vidMap = new Map(videoUpdateTime.map(item => [item.vid, item]));
        vidMap.set(videoTimeObj.vid, videoTimeObj);

        videoUpdateTime = [...vidMap.values()];

        this.setData({
            videoUpdateTime
        })
    },

    handleEnded(event) {
        let {
            videoUpdateTime
        } = this.data
        let index = videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id)
        videoUpdateTime.splice(index, 1)
        this.setData({
            videoUpdateTime
        })
    },

    handleRefresher() {
        this.setData({
            isTriggered: true
        })
        this.getVideoList(this.data.navId)
    },

    handleToLower() {
        this.setData({
            offset: this.data.offset + 1
        })
        this.getVideoList(this.data.navId, this.data.offset, true)
    },

    onLoad: function(options) {
        //获取导航栏数据
        this.getVideoGroupListData()
    },

    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: '转发内容',
            page: '/pages/video/video',
            imageUrl: this.data.videoList[0].data.coverUrl || '/static/images/nvsheng.jpg'
        }
    }
})