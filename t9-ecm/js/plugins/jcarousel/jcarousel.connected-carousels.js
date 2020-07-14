/**
 * jcarsousel的插件二次封装
 * 主要特性就是让大图和小的导航图链接起来
 * @author 骆宏
 * @email 846705189@qq.com
 * @date 2016-02-04 14:17 pm
 * */
function ConnectedCarousels(){

}

// This is the connector function.
// It connects one item from the navigation carousel to one item from the
// stage carousel.
// The default behaviour is, to connect items with the same index from both
// carousels. This might _not_ work with circular carousels!
ConnectedCarousels.connector = function(itemNavigation, carouselStage) {
    return carouselStage.jcarousel('items').eq(itemNavigation.index());
};

ConnectedCarousels.prototype = {
    init: function(){
        //其中20为border的宽度
        $("#prodImgContainer li img").css({width: $(".connected-carousels").width() - 20, height: "400px"});  

        // Setup the carousels. Adjust the options for both carousels here.
        var carouselStage      = $('.carousel-stage').jcarousel();
        var carouselNavigation = $('.carousel-navigation').jcarousel();
        
        // We loop through the items of the navigation carousel and set it up
        // as a control for an item from the stage carousel.
        carouselNavigation.jcarousel('items').each(function(){
            var item = $(this);

            // This is where we actually connect to items.
            var target = ConnectedCarousels.connector(item, carouselStage);

            item.on('jcarouselcontrol:active', function() {
                carouselNavigation.jcarousel('scrollIntoView', this);
                item.addClass('active');
            }).on('jcarouselcontrol:inactive', function() {
                item.removeClass('active');
            }).jcarouselControl({
                target: target,
                carousel: carouselStage
            });
        });

        // Setup controls for the stage carousel
        $('.prev-stage').on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        }).on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        }).jcarouselControl({
            target: '-=1'
        });

        $('.next-stage').on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        }).on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        }).jcarouselControl({
            target: '+=1'
        });
    }
};
