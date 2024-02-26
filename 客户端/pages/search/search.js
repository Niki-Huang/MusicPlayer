import request from '../../utils/request'
import _ from '../../utils/lodash'
// 防抖时间
let debounceInterval = 500;
// 创建防抖函数
let debouncedSearch;
Page({
    data: {
        placeholderContent: '', // placeholder的内容
        hotList: [], // 热搜榜数据
        searchContent: '', // 用户输入的表单项数据
        searchList: [], // 关键字模糊匹配的数据
        historyList: [], // 搜索历史记录
    },

    onLoad: function(options) {
        this.getInitData();
        this.getSearchHistory();
        debouncedSearch = _.debounce(this.getSearchList, debounceInterval);
    },

    async getInitData() {
        let placeholderData = await request('/search/default');
        let hotListData = await request('/search/hot/detail');
        this.setData({
            placeholderContent: placeholderData.data.showKeyword,
            hotList: hotListData.data
        })
    },

    getSearchHistory() {
        let historyList = wx.getStorageSync('searchHistory');
        if (historyList) {
            this.setData({
                historyList
            })
        }
    },

    handleInputChange(event) {
        this.setData({
            searchContent: event.detail.value.trim()
        })
        debouncedSearch()
    },

    async getSearchList() {
        if (!this.data.searchContent) {
            this.setData({
                searchList: []
            })
            return;
        }
        let {
            searchContent,
            historyList
        } = this.data;
        let searchListData = await request('/search', {
            keywords: searchContent,
            limit: 10
        });
        this.setData({
            searchList: searchListData.result.songs
        })

        if (historyList.indexOf(searchContent) !== -1) {
            historyList.splice(historyList.indexOf(searchContent), 1)
        }
        historyList.unshift(searchContent);
        this.setData({
            historyList
        })

        wx.setStorageSync('searchHistory', historyList)
    },

    clearSearchContent() {
        this.setData({
            searchContent: '',
            searchList: []
        })
    },

    deleteSearchHistory() {
        wx.showModal({
            content: '确认删除吗?',
            success: (res) => {
                if (res.confirm) {
                    this.setData({
                        historyList: []
                    })
                    wx.removeStorageSync('searchHistory');
                }
            }
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