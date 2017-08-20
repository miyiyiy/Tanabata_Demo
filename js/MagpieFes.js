var MagpieFes=function(){
	var config={
		keepZoomRatio:false,
		layer:{
			'width':'100%',
			'height':'100%',
			'top':0,
			'left':0
		},
		audio:{
			enable:true,//是否开启音乐
  			playURL:'./music/happy.wav',//正常播放地址
  			cycleURL:'./music/circulation.wav'//正常循环播放地址
		},
		setTime:{
			walkToThird:6000,
			walkToMiddle:6500,
			walkToEnd:6000,
			walkTobridge:2000,
			bridgeWalk:2000,
			walkToShop:1500,
			walkOutShop:1500,
			openDoorTime:800,
			shutDoorTime:500,
			waitRotate:850,
			waitFlower:800},
		snowflakeURL:[
			'./images/snowflake/snowflake1.png',
			'./images/snowflake/snowflake2.png',
			'./images/snowflake/snowflake3.png',
			'./images/snowflake/snowflake4.png',
			'./images/snowflake/snowflake5.png',
			'./images/snowflake/snowflake6.png']
	};
	
	var debug=0;
	if(debug){
		$.each(config.setTime,function(key,val){
			config.setTime[key]=500;
		});
	}
	if(config.keepZoomRatio){
		var proportionY=900/1440;
		var screenHeight=$(document).height();
		var zoomHeight=screenHeight*proportionY;
		var zoomTop=(screenHeight-zoomHeight)/2;
		config.layer.height=zoomHeight;
		config.layer.top=zoomTop;
	}
	//获取数据
	var instanceX;
	var container=$('#content');
	var swipe=Swipe(container);
	var visualWidth=container.width();
	var visualHeight=container.height();
	var getValue=function (className) {
		/* body... */
		var $elem=$(''+className+'');
		return {
			height:$elem.height(),
			top:$elem.position().top
		};
	};
	//路 y轴
	var pathY=function () {
		var data=getValue('.a_background_middle');
		return data.top+data.height/2;
	}();
	var bridgeY=function(){
  			var data=getValue('.c_background_middle');
  			return data.top;
  	}();
  	var animationEnd=(function(){
		var explorer=navigator.userAgent;
		if(~explorer.indexOf('webkit')){
			return 'webkitAnimationEnd';
		}
		return 'animationend';
	})();

	if(config.audio.enable){
		var audio1=Hmlt5Audio(config.audio.playURL);
		audio1.end(function () {
			Hmlt5Audio(config.audio.cycleURL,true);});
	}
	//动画处理,开始走路
	function scrollTo(time, proportionX) {
        var distX = container.width()*proportionX;
        swipe.scrollTo(distX, time);
    }
    //小女孩
	var girl={
		elem:$('.girl'),
		getHeight:function(){
			return this.elem.height();
		},
		//转身动作
		rotate:function(){
			this.elem.addClass('girl-rotate');
		},
		setOffset:function(){
			this.elem.css({
				left:visualWidth/2,
				top:bridgeY-this.getHeight()
			});
		},
		getOffset:function(){
			return this.elem.offset();
		},
		getWidth:function(){
			return this.elem.width();
		}
	};
	//bird
	var bird={
		elem:$('.bird'),
		fly:function(){
			this.elem.addClass('birdFly');
			this.elem.transition({
				right:container.width()
			},15000,'linear');
		}
	};
	//logo 动画
	var logo={
		elem:$('.logo'),
		run:function(){
			this.elem.addClass('logolightSpeedIn').on(animationEnd,function(){
				$(this).addClass('logoshake').off();
			});
		}
	};
	function snowflake(){
		var $flakeContainer=$('#snowflake');
		//随机选择一张图
		function getImagesName(){
			return config.snowflakeURL[[Math.floor(Math.random()*6)]];
		}
		function createSnowBox () {
			var url=getImagesName();
			return $('<div class="snowbox"/>').css({
				'width':41,
				'height':41,
				'position':'absolute',
				'backgroundSize': 'cover',
				'zIndex':100000,
				'top':'-41px',
				'backgroundImage':'url('+url+')' 
			}).addClass('snowRoll');
		}
		//开始飘花
		setInterval(function(){
			//运动的轨迹
			var startPositionLeft=Math.random()*visualWidth-100,
				startOpacity=1,
				endPositionTop=visualHeight-40,
				endPositionLeft=startPositionLeft-100+Math.random()*500,
				duration=visualHeight*10+Math.random()*5000;
			//随机透明度
			var randomStart=Math.random();
			randomStart=randomStart<0.5?startOpacity:randomStart;
			//创建一个雪花
			var $flake=createSnowBox();
			//设计起点位置
			$flake.css({
				left:startPositionLeft,
				opacity:randomStart
			});
			//加入到容器
			$flakeContainer.append($flake);
			//开始执行动画
			$flake.transition({
				top:endPositionTop,
				left:endPositionLeft,
				opacity:0.7
			},duration,'ease-out',function () {
				$(this).remove();
			});

		},200);
	}
	//
	  		//背景音乐
	function Hmlt5Audio(url,isloop){
		var audio=new Audio(url);
		audio.autoPlay=true;
		audio.loop=isloop||false;
		audio.play();
		return {
			end:function(callback){
				audio.addEventListener('ended', function(){
					callback();
				}, false);
			}
		};
	}
	//
	var boy=BoyWalk();
	boy.walkTo(config.setTime.walkToThird,0.6).then(function(){
			scrollTo(config.setTime.walkToMiddle,1);
			return boy.walkTo(config.setTime.walkToMiddle,0.5);
		})
		.then(function(){
			bird.fly();
		})
		.then(function(){
			boy.stopWalk();
			return BoyToShop(boy);
		})
		.then(function(){
			girl.setOffset();
			scrollTo(config.setTime.walkToEnd,2);
			return boy.walkTo(config.setTime.walkToEnd,0.15);
		})
		.then(function(){
			return boy.walkTo(config.setTime.walkTobridge,0.25,(bridgeY-girl.getHeight())/visualHeight);
		})
		.then(function(){
			//实际走路的比例
			var proportionX=(girl.getOffset().left-boy.getWidth()-instanceX+girl.getWidth()/5)/visualWidth;
			//第三次桥上直走到小女孩面前
			return boy.walkTo(config.setTime.bridgeWalk,proportionX);
		})
		.then().then(function(){
			boy.resetOriginal();
			setTimeout(function(){
				girl.rotate();
				boy.rotate(function(){
					//logo.run();
					snowflake();
				});
			},config.setTime.waitRotate);
		});
	function BoyWalk(){
		var $boy=$('#boy');
		var boyHeight=$boy.height();
		var boyWidth=$boy.width();
		//修正小男孩的正确位置
		//路的中间位置减去小孩的高度 25是一个修正值
		$boy.css({
			top:pathY-boyHeight+25
		});
		//动画处理
		function pauseWalk(){
			$boy.addClass('pauseWalk');
		}
		//恢复走路
		function restoreWalk(){
			$boy.removeClass('pauseWalk');
		}
		function slowWalk () {
			$boy.addClass('slowWalk');
		}
		//计算移动距离
		function calculateDist (direction,proportion) {
			return (direction == 'x'?visualWidth:visualHeight)*proportion;
		}

		//用transition做运动
		function startRun (options,runTime) {
			//deferred对象是jQuery对Promises接口的实现。
			//它是非同步操作的通用接口，可以被看作是一个等待完成的任务，
			//开发者通过一些通过的接口对其进行设置。
			//通过jQuery.Deferred() 在未来某个时候 得到 ‘延时’返回值。
			var dfdPlay=$.Deferred();
			//恢复走路
			restoreWalk();
			$boy.transition(options,runTime,'linear',function(){
				dfdPlay.resolve();
			});
			return dfdPlay;
		}

		//开始走路
		function walkRun (time,dist,disY) {
			time=time||3000;
			//脚动作
			slowWalk();
			//开始走路
			var d1=startRun({
				'left':dist+'px',
				'top':disY?disY:undefined
			},time);
			return d1;
		}
		function walkToShop (runTime) {
			var defer=$.Deferred();
			var doorObj=$('.door');
			//门的坐标
			var offsetDoor=doorObj.offset();
			var doorOffsetLeft=offsetDoor.left;
			//小孩当前的坐标
			var offsetBoy=$boy.offset();
			var boyOffsetLeft=offsetBoy.left;
			//当前需要移动的坐标
			instanceX=(doorOffsetLeft+doorObj.width()/2)-(boyOffsetLeft+$boy.width()/2);
			//开始走路
			var walkPlay=startRun({
				transform:'translateX('+instanceX+'px),scale(0.3,0.3)',
				opacity:0.1
			},2000);
			//走路完毕
			walkPlay.done(function(){
				$boy.css({opacity: 0});
				defer.resolve();
			});
			return defer;
		}
		function walkOutShop(runTime){
			var defer=$.Deferred();
			restoreWalk();
			//开始走路
			var walkPlay=startRun({
				transform:'translateX('+instanceX+'px),scale(1,1)',
				opacity:1
			},runTime);
			walkPlay.done(function () {
				defer.resolve();
			});
			return defer;
		}

		function takeFlower () {
			var defer=$.Deferred();
			setTimeout(function(){
				//取花
				$boy.addClass('slowFlowerWalk');
				defer.resolve();
			},config.setTime.waitFlower);
			return defer;
		}
		return {
			walkTo:function(time,proportionX,proportionY){
				var distX=calculateDist('x',proportionX);
				var distY=calculateDist('y',proportionY);
				return walkRun(time,distX,distY);
			},
			//走进商店
			toShop:function(){
				return walkToShop.apply(null,arguments);
			},
			//走出商店
			outShop:function() {
				return walkOutShop.apply(null,arguments);
			},
			//停止走路
			stopWalk:function(){
				pauseWalk();
			},
	        takeFlower:function () {
	        	return takeFlower();
	        },
	        getWidth:function(){
	        	return $boy.width();
	        },
	        resetOriginal:function(){
	        	this.stopWalk();
	        	$boy.removeClass('slowWalk slowFlowerWalk').addClass('boyOriginal');
	        },
	        rotate:function(callback){
	        	restoreWalk();
	        	$boy.addClass('boy-rotate');
	        	//监听转身完毕
	        	if(callback){
	        		$boy.on(animationEnd,function(){
	        			callback();
	        			$(this).off();
	        		});
	        	}
	        },
	        getDistance:function(){
	        	return $boy.offset().left;
	        }

		};
	}

	var BoyToShop=function(boyObj){
		var $door=$('.door');
		var doorLeft=$('.door-left');
		var doorRight=$('.door-right');
		function doorAction(left,right,time)
		{
			
			var defer=$.Deferred();
			var count=2;
			var complete=function(){
				if(count==1)
				{
					defer.resolve();
					return;
				}
				count--;
			};
			doorLeft.transition({
				'left':left
			},time,complete);
			doorRight.transition({
				'left':right
			},time,complete);
			return defer;
		}
		//开门
		function openDoor(time){
			return doorAction('-50%','100%',time);
		}
		//关门
		function shutDoor(time){
			return doorAction('0%','50%',time);
		}
		//灯动画
		var lamp={
			elem:$('.b_background'),
			bright:function(){
				this.elem.addClass('lamp-bright');
			},
			dark:function(){
				this.elem.removeClass('lamp-bright');
			}
		};
		var defer=$.Deferred();
		var waitOpen=openDoor(config.setTime.openDoorTime);
		waitOpen.then(function(){
						lamp.bright();
						return boyObj.toShop($door,config.setTime.walkToShop);
					})
				.then(function(){ return boyObj.takeFlower()})
				.then(function(){
					return boyObj.outShop(config.setTime.walkOutShop);})
				.then(function(){ 
					shutDoor(config.setTime.shutDoorTime);
					lamp.dark();
					defer.resolve();
					});
		return defer;
	};
};

/////////
//页面滑动 //
/////////

/**
 * [Swipe description]
 * @param {[type]} container [页面容器节点]
 * @param {[type]} options   [参数]
 */
function Swipe(contianer)
{
	var element=contianer.find(':first');
	var swipe={};
	//li页面数量
	var slides=element.find('>');
	//获取容器尺寸
	var width=contianer.width();
	var height=contianer.height();
	element.css({
		width:(slides.length*width)+'px',
		height: height+'px'
	});
	//设置每个li页面的宽度
	$.each(slides,function(index){
		var slide=slides.eq(index);
		slide.css({
			width : width+'px',
			height: height+'px'
		});
	});

	swipe.scrollTo=function (x,speed) {
		/* body... */
		//执行动画移动
		element.css({
			'transition-timing-function':'linear',
			'transition-duration':speed+'ms',
			'transform':'translate3d(-'+(x)+'px,0px,0px)'
		});
		return this;
	};
	return swipe;
}

$(function(){MagpieFes();});



