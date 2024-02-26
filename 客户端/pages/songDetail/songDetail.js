import pubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../utils/request.js'
const appInstance = getApp();
let startX = 0;
let moveX = 0;
let moveDistance = 0;
let originPosition = 0;
let startPlayPosition = 0;
Page({

    data: {
        isPlay: false,
        song: {},
        musicId: '',
        musicLink: '',
        currentTime: '00:00',
        durationTime: '00:00',
        currentWidth: 0,
        isPull: false
    },

    async musicControl(isPlay, musicId, musicLink) {
        if (isPlay) {
            if (!musicLink) {
                let musicLinkData = await request('/song/url', {
                    id: musicId
                })
                musicLink = musicLinkData.data[0].url
                this.setData({
                    musicLink
                })
            }
            this.backgroundAudioManager.src = musicLink
            this.backgroundAudioManager.title = this.data.song.name
        } else {
            this.backgroundAudioManager.pause();
        }
    },

    handleMusicPlay() {
        let isPlay = !this.data.isPlay;
        let {
            musicId,
            musicLink
        } = this.data
        this.musicControl(isPlay, musicId, musicLink)
    },

    async getMusicInfo(musicId) {
        let songData = await request('/song/detail', {
            ids: musicId
        })
        let durationTime = moment(songData.songs[0].dt).format('mm:ss')
        this.setData({
            song: songData.songs[0],
            durationTime
        })
    },

    changePlayState(isPlay) {
        this.setData({
            isPlay
        })
        appInstance.globalData.isMusicPlay = isPlay
    },

    handleSwitch(event) {
        let type = event.currentTarget.id
        this.backgroundAudioManager.stop()
        pubSub.publish('switchType', type)
    },

    onLoad: function(options) {
        let musicId = options.musicId
        this.setData({
            musicId
        })
        this.getMusicInfo(musicId)

        if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
            this.setData({
                isPlay: true
            })
        }

        this.backgroundAudioManager = wx.getBackgroundAudioManager()
        this.backgroundAudioManager.onPlay(() => {
            this.changePlayState(true)
            appInstance.globalData.musicId = musicId
        });
        this.backgroundAudioManager.onPause(() => {
            this.changePlayState(false)
        })
        this.backgroundAudioManager.onStop(() => {
            this.changePlayState(false)
        })
        this.backgroundAudioManager.onTimeUpdate(() => {
            let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
            let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 450
            if (!this.data.isPull)
                this.setData({
                    currentTime,
                    currentWidth
                })
        })
        this.backgroundAudioManager.onEnded(() => {
            pubSub.publish('switchType', 'next')
            this.setData({
                currentWidth: 0,
                currentTime: '00:00'
            })
        })

        pubSub.subscribe('musicId', (msg, musicId) => {
            this.getMusicInfo(musicId)
            this.musicControl(true, musicId)
        })
    },

    handleTouchStart(event) {
        startX = event.touches[0].clientX;
        originPosition = this.data.currentWidth
        this.setData({
            isPull: true
        })
    },

    handleTouchMove(event) {
        moveX = event.touches[0].clientX;
        moveDistance = originPosition + (moveX - startX) * 2;
        if (moveDistance <= 0)
            moveDistance = 0
        if (moveDistance >= 450)
            moveDistance = 450;
        this.setData({
            currentWidth: moveDistance,
        })
        let musicRatio = this.data.currentWidth * 1.0 / 450
        startPlayPosition = musicRatio * this.data.song.dt
        let currentTime = moment(startPlayPosition).format('mm:ss')
        this.setData({
            currentTime
        })
    },

    handleTouchEnd(event) {
        this.backgroundAudioManager.seek(parseInt(moment(startPlayPosition).format('X')))
        this.setData({
            isPull: false
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