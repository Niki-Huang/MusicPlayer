import {
    testPhone,
    alert
} from '../../utils/normal_fun.js'
import request from '../../utils/request.js'

let interval;
Page({
    data: {
        phone: '',
        verifycode: '',
        disabled: false,
        countdown: 10,
        verifytext: '获取验证码',
        unikey: '',
        qrimgbase64: ''
    },

    handleInput(event) {
        let type = event.currentTarget.id;
        this.setData({
            [type]: event.detail.value,
        })
    },

    async verify() {
        //手机号验证
        if (!this.data.phone) {
            alert("手机号不能为空");
            return;
        }
        if (!testPhone(this.data.phone)) {
            alert("手机号格式错误");
            return;
        }
        //发送验证码
        let result = await request('/captcha/sent', {
            phone: this.data.phone
        })
        if (result.code == 200)
            alert('验证码已发送', 'success', 1500);
        else
            alert('验证码发送失败，请重试', 'none', 1500);
        this.setData({
            countdown: this.data.countdown - 1,
            verifytext: '重新获取验证码(' + (this.data.countdown - 1) + ')',
            disabled: true
        })
        const interval = setInterval(() => {
            this.setData({
                countdown: this.data.countdown - 1,
                verifytext: '重新获取验证码(' + (this.data.countdown - 1) + ')',
            })
            if (this.data.countdown == 0) {
                clearInterval(interval);
                this.setData({
                    verifytext: '获取验证码',
                    countdown: 10,
                    disabled: false
                })
            }
        }, 1000);
    },

    async qr() {
        //获取key值
        let qr = await request('/login/qr/key')
        if (qr.code != 200) {
            alert('获取验证码失败', 'none');
            return;
        }
        let unikey = qr.data.unikey;
        this.setData({
            unikey: unikey
        })
        //根据key值获取对应的二维码的base64编码
        let qrimg = await request('/login/qr/create', {
            key: unikey,
            qrimg
        })
        this.setData({
            qrimgbase64: qrimg.data.qrimg
        })
    },

    async login() {
        let {
            phone,
            password
        } = this.data;
        //手机号验证  13328701289
        if (!phone) {
            alert("手机号不能为空");
            return;
        }
        if (!testPhone(phone)) {
            alert("手机号格式错误");
            return;
        }
        //密码验证
        if (!this.data.verifycode) {
            alert('验证码不能为空');
            return;
        }
        let result = await request('/captcha/verify', {
            phone: this.data.phone,
            captcha: this.data.verifycode
        })
        if (result.code == 200) {
            console.log(111, result);
            alert('登录成功', 'success', 1500)
        } else
            alert('验证码错误', 'none', 1500)
    },

    onLoad: async function(options) {
        //获取key值
        let qr = await request('/login/qr/key')
        if (qr.code != 200) {
            alert('获取验证码失败', 'none');
            return;
        }
        let unikey = qr.data.unikey;
        this.setData({
            unikey: unikey
        })
        //根据key值获取对应的二维码的base64编码
        let qrimg = await request('/login/qr/create', {
            key: unikey,
            qrimg
        })
        this.setData({
            qrimgbase64: qrimg.data.qrimg
        })
        //轮询检查是否扫码完成
        interval = setInterval(async() => {
            let qrlogincheck = await request('/login/qr/check', {
                key: this.data.unikey,
            })
            if (qrlogincheck.code == 800)
                alert('二维码已过期')
            else if (qrlogincheck.code == 803) {
                alert('登录成功', 'success');
                wx.setStorageSync('musiccookie', qrlogincheck.cookie)
                wx.switchTab({
                    url: '/pages/personal/personal',
                })
            } else if (qrlogincheck.code == 801)
                console.log('等待扫码')
        }, 2000);
    },

    onReady: function() {

    },

    onShow: function() {

    },

    onHide: function() {

    },

    onUnload: function() {
        clearInterval(interval);
    },

    onPullDownRefresh: function() {

    },

    onReachBottom: function() {

    },

    onShareAppMessage: function() {

    }
})