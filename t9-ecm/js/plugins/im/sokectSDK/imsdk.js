(function (WINDOW) {
    WINDOW.imSDK = function (url,imUid,msgCallBackFunc,successCallBack,isReconnect,busUid,headImg,nickName) {
        if (!window.WebSocket) {
            window.WebSocket = window.MozWebSocket;
        }
        if (!window.WebSocket) {
            alert("抱歉，您的浏览器不支持WebSocket协议!");
            return;
        }
        if (imSDK._CONS_ && imSDK._CONS_.WEB_SOCKET && url == imSDK._CONS_.URL) {
            imSDK.close();
        }
        imSDK._init_(url,imUid,msgCallBackFunc,successCallBack,isReconnect,busUid,headImg,nickName);
        imSDK.initWebSocket();
        imSDK.self = this;
    };
    imSDK.self = {};
    var configure = {
        heartbeatStr:"ping",								//心跳字符串
        heartbeatTimer:1500,							//心跳定时器
        timeoutTimer:null,								//超时定时器
        heartbeatMS:3000,								//心跳时间
        timeoutMS:30000,								//超时时间
        reconnectNum:0,									//重连次数
        reconnectMaxNum:20,								//最大重连次数
        reconnectMS:1000									//重连 毫秒 （梯度）
    };
    imSDK._init_ = function (url,imUid,msgCallBackFunc,successCallBack,isReconnect,busUid,headImg,nickName) {
        this._CONS_={
            URL : url,											//socket 服务器地址
            WEB_SOCKET:null,								//websocket 对象
            imUid:imUid,                                    //imUid
            msgCallBackFunc:msgCallBackFunc,
            successCallBack:successCallBack,
            isReconnect:isReconnect?isReconnect:true,			//是否自动重连
            EVENT_TYPE:{										//事件类型
                open :"open",									//通道打开
                message: "message",								//服务端消息接收
                close: "close",									//通道关闭
                error: "error"									//消息异常
            }
        }
        this._BUSUSERINFO_={
            busUid : busUid,
            headImg:headImg,
            nickName:nickName
        }
    };
    imSDK.handle= function (eventType,event,msg) {
        try {
            this._CONS_.handleFunc(eventType,event,msg);
        } catch (e) {
            console.error("业务处理回调方法异常：");
            console.error(e);
        }
    },
    imSDK.pinga =function(){
        var imdata = new proto.IMData();
        imdata.setType(4);
        imdata.setTimestamp(new Date().getTime());
        if(imSDK._CONS_.WEB_SOCKET.readyState===1 || imSDK._CONS_.WEB_SOCKET.readyState == WebSocket.OPEN){
            imSDK._CONS_.WEB_SOCKET.send(imdata.serializeBinary());
        }else{
            console.error("ping fail");
        }
        setTimeout("imSDK.pinga()",configure.heartbeatMS);
    }
    imSDK.initWebSocket = function () {
        var self = this;
        //重连
        function reconnect () {
            imSDK._CONS_.WEB_SOCKET.close();
            if (self._CONS_.isReconnect) {
                connect();
                configure.timeoutTimer = null;
            }
            console.debug("重连--------------");
            console.debug(configure);
            console.debug("重连--------------");
        }

        //设置长时间无通信处理定时器
        function setTimeoutTimer(timerTime) {
            if (configure.timeoutTimer) {
                clearTimeout(configure.timeoutTimer);
            }
            configure.timeoutTimer = setTimeout(function (){
                configure.timeoutTimer = null;
                reconnect();
            },timerTime);
        }

        //设置心跳定时器
        function setTeartbeatTimer () {
            setTimeout("imSDK.pinga()",configure.heartbeatMS);
        }

        //异常重连
        function errorReconnect() {
            if (!configure.timeoutTimer) {
                if (configure.reconnectNum < configure.reconnectMaxNum) {
                    configure.reconnectNum = configure.reconnectNum + 1;
                    configure.timeoutTimer = setTimeoutTimer(configure.reconnectMS);
                } else {
                    console.error("无法连接请稍后再试");
                }
            }
        }

        //连接
        function connect() {
            if('WebSocket' in window){
                self._CONS_.WEB_SOCKET=new WebSocket(self._CONS_.URL);
            }else if ('MozWebSocket' in window){
                self._CONS_.WEB_SOCKET = new MozWebSocket(self._CONS_.URL);
            }
            //消息接收监听
            imSDK._CONS_.WEB_SOCKET.onmessage = function (event) {
                var reader = new FileReader();
                reader.readAsArrayBuffer(event.data);
                reader.onload = function (e) {
                    var buf = new Uint8Array(reader.result);
                    var imDate = proto.IMData.deserializeBinary(buf);
                    if(imDate==undefined){
                        console.info("错误的消息");
                    }
                    if(imDate.getType() === 4){
                        return;
                    }
                    if(imDate.getType() === 1){
                        return;
                    }
                    //TODO 消息防丢处理
                    if(imDate.getType() === 3){
                        return;
                    }
                    if(imDate.getType() === 2){
                        imSDK._CONS_.msgCallBackFunc(imDate);
                        var imdataResponse = new proto.IMData();
                        imdataResponse.setId(imDate.getId());
                        imdataResponse.setType(3);
                        imSDK._CONS_.WEB_SOCKET.send(imdataResponse.serializeBinary());
                    }
                }
            };
            //通道开启事件
            imSDK._CONS_.WEB_SOCKET.onopen = function (event) {
                console.debug("开启--------------");
                console.debug(configure);
                console.debug(event);
                console.debug("开启--------------");
                if(imSDK._CONS_.successCallBack && typeof imSDK._CONS_.successCallBack == "function") imSDK._CONS_.successCallBack();
            };
            //关闭事件
            imSDK._CONS_.WEB_SOCKET.onclose = function (event) {
                console.debug("关闭--------------");
            };
            //异常事件
            imSDK._CONS_.WEB_SOCKET.error = function (event) {
                errorReconnect();
            }
        };
        connect();
        setTeartbeatTimer ();
    }
    imSDK.prototype = {
        close : function () {
            console.info("============")
            clearTimeout(configure.timeoutTimer);
            configure.timeoutTimer= null;
            clearTimeout(configure.heartbeatTimer);
            configure.heartbeatTimer= null;
            imSDK._CONS_.WEB_SOCKET.close();
        },
        send :function (sysId,toUserId,sType,msgType,msg,customType) {	//发送消息
            if (imSDK._CONS_.WEB_SOCKET.readyState ===1 || imSDK._CONS_.WEB_SOCKET.readyState == WebSocket.OPEN) {
                try {
                    var imdata = new proto.IMData();
                    imdata.setId(new Date().getTime());
                    imdata.setType(2);
                    imdata.setTimestamp(new Date().getTime());
                    var msgData = new proto.IMData.MsgData();
                    if(sysId!=undefined&&sysId!="") {
                        msgData.setSysid(Long.fromValue(sysId, false));
                    }
                    var fromData = new proto.IMData.MsgData.FromUser();
                    fromData.setId(Long.fromValue(imSDK._CONS_.imUid,false));
                    if(sysId!=undefined&&sysId!=""){
                        fromData.setSysid(Long.fromValue(sysId,false));
                    }
                    fromData.setBususerid(imSDK._BUSUSERINFO_.busUid);
                    fromData.setHeadimg(imSDK._BUSUSERINFO_.headImg);
                    fromData.setNickname(imSDK._BUSUSERINFO_.nickName);
                    msgData.setFromuser(fromData);
                    msgData.setMsgbody(msg);
                    msgData.setMsgtype(msgType);
                    if(msgType!=undefined&&msgType=='custom'){
                        if(customType==undefined||customType==''){
                            alert("自定义消息中自定义类型不能为空自定义类型不能为空")
                            return;
                        }
                        msgData.setCustomtype(customType);
                    }
                    msgData.setStype(sType);
                    msgData.setTouserid(Long.fromValue(toUserId,false));
                    msgData.setSendtime(new Date().getTime());
                    imdata.setMsgdata(msgData);
                    imSDK._CONS_.WEB_SOCKET.send(imdata.serializeBinary());
                    return true;
                } catch (e){
                    console.error(e);
                    console.error("网络异常，请稍后再试！！！");
                    return false;
                }
            } else {
                console.error("网络异常，请稍后再试！！！");
                imSDK._CONS_.WEB_SOCKET.error("");
                return false;
            }
        }
    }
})(window);

