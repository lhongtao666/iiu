$(function(){
	var callOut = new CallOut();
	callOut.init();
});

function CallOut(){
	this.hadInit = false;
}

CallOut._CONS_ = {
	CALL_OUT_URL: "http://192.168.0.10:8081/t9-ecm/CCTV/cti/diaout.htm",
};

CallOut.prototype = {
	init:function(params){
		if(!this.hadInit){
			jQuery.support.cors = true;
			this.hadInit = true;
			this._bindEventHander();
		}	    	
	},
	_bindEventHander:function(){
		var self = this;
		$("body").on("click",".callOutBtn", function(){
			var csPhoneNum = $("#callOutModal").find("input[name=csPhoneNum]").val();
			var adnNo = $("#adnNo").val();
			if(isNaN(adnNo) || !adnNo){
				self.infoTip("请输入正确的分机");
				return;
			}
			window.localStorage.setItem("callOut_adnNo", adnNo);
			$.ajax({
		            type: "POST",
		            url: CallOut._CONS_.CALL_OUT_URL,
		            data: {'csPhoneNum':csPhoneNum,'adnNo':adnNo},
		            dataType: "json",
		            contentType: "application/x-www-form-urlencoded;charset=utf-8",
		            async:false,
		            error: function(error) {
		                self.infoTip("请求失败!");
		            },
		            success: function(result) {
		            	if(result.success){
		            		alert("请求成功");
		            		$("#callOutModal").modal("hide");
		            		$("#callOutModal").find("input[name=number]").val();
		            	}else{
		            		self.infoTip(result.msg);
		            	}
		            }
		        });
		});
	},
	infoTip:function(text){
		var self = this;
		$("#adnNo").attr("title","")
              .attr("data-container","body")
              .attr ("data-toggle","popover")
              .attr("data-content","<h5 style='color:red;'>"+text+"</h5>")
              .attr("data-html","true")
              .attr("data-placement","bottom");
              $("#adnNo").popover('show');
              setTimeout(function(){ self.destroyTipPopover(); }, 2000);
	},
	destroyTipPopover:function(){
		$("#adnNo").popover("destroy");
	}
};