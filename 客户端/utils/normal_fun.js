//手机号的正则检测
function testPhone(phone) {
    let phoneReg = /^1[^2]\d{9}$/;
    if (!phoneReg.test(phone))
        return false;
    else
        return true;
}
//警告框
function alert(title = '无', icon = 'none', duration = 1000) {
    wx.showToast({
        title: title,
        icon: icon,
        duration: duration
    })
}

export {
    testPhone,
    alert,
}