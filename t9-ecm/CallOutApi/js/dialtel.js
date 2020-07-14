function dialtel(csPhone,adnNo){
    if(!csPhone || isNaN(csPhone)){
        alert('号码为空或号码格式错误');
        return false;
    }
    if(!adnNo || isNaN(adnNo)){
        alert('分机号为空或号码格式错误');
        return false;
    }
    jQuery.support.cors = true;
    $.ajax({
        type: "POST",
        url: "http://t9ecm.f3322.net:8088/t9-ecm/CCTV/cti/diaout.htm",
        data: {'csPhoneNum':csPhone,'adnNo':adnNo},
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=utf-8",
        async:false,
        error: function(error) {
            alert("链接请求失败！");
        },
        success: function(result) {
            if(result.success){
                alert("请求成功");
            }else{
                alert(result.msg);
            }
        }
    });
}