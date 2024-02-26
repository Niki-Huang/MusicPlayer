import config from './config'

//发送ajax请求
export default (url, data = {}, method = 'GET') => {
    const newData = { ...data,
        timestamp: new Date().getTime()
    };
    return new Promise((resolve, reject) => {
        //1、new Promise初始化promise实例的状态为pending
        wx.request({
            url: config.host + url,
            data: newData,
            method,
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        })
    })
}